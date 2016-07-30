// Reference to the google map
var map;

// Reference to the directions render. So that we can clear and re-use it if start/end changes.
var directionsDisplay;

// The list bike racks retrieved from the server.
var bikeracks;

// The set of markers rendered to the map.
var markers;

// Needs to be in global scope so that Google maps can do a callback.
// Called after google maps JS is loaded.
function initMap() {
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -27.469, lng: 153.023 },
        zoom: 8
    });

    // Set-up place autocomplete
    setupPlaceAutocomplete($("#from-text")[0]);
    setupPlaceAutocomplete($("#destination-text")[0]);
}

function setupPlaceAutocomplete(textbox) {
    var brisbane = {
        lat: -27.469, lng: 153.023
    };
    var circle = new google.maps.Circle({
        center: brisbane,
        radius: 2000 // 4km
    });

    // Bounds around Brisbane, to make autocomplete suggestions more helpful.
    var autocompleteOptions = {
        bounds: circle.getBounds(),
        componentRestrictions: { country: "au" }
    };
    var autocomplete = new google.maps.places.Autocomplete(textbox, autocompleteOptions);
    autocomplete.bindTo('bounds', map);
}

$(document).ready(function () {
    $.ajax("/api/bikerack").done(function (data) {
        bikeracks = data;
    });
});

// Called by index.html to tell us #map is being shown.
function showMap() {
    if (map) {
        google.maps.event.trigger(map, 'resize');
    }
}

function getNearbyBikeRacks(endLatLng) {
    // Delta measures distance between endpoint and bike rack in degrees lat/lng.
    // One degree is quite a distance.
    var minimumDelta = 1;
    var nearestRack = null;
    for (var i = 0; i < bikeracks.length; i++) {
        // Apply pythag
        var bikerack = bikeracks[i];
        var deltaLat = Math.abs(bikerack.Latitude - endLatLng.lat());
        var deltaLng = Math.abs(bikerack.Longitude - endLatLng.lng());
        var delta = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);

        if (delta < minimumDelta)
        {
            minimumDelta = delta;
            nearestRack = bikerack;
        }
    }
    return nearestRack;
}

function calculateAndDisplayRoute(start, end) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ "address": end }, function (results, status) {
        if (status == 'OK') {
            var endLatLng = results[0].geometry.location;

            // Gets the nearest bike rack to the endpoint.
            var nearestRack = getNearbyBikeRacks(endLatLng);

            // Bail.
            if (!nearestRack) {
                window.alert('No bike rack found near destination.');
                return;
            }
            var waypoints = [];
            waypoints.push({
                location: new google.maps.LatLng(nearestRack.Latitude, nearestRack.Longitude),
                stopover: true
            }) 

            var directionsService = new google.maps.DirectionsService;
            directionsService.route({
                origin: start,
                destination: end,
                waypoints: waypoints,
                travelMode: 'BICYCLING'
            }, function (response, status) {
                if (status === 'OK') {
                    displayRoute(response);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }
    });
}

function displayRoute(directions) {
    if (!directionsDisplay) {
        var renderOptions = {
            // We will draw our own markers.
            suppressMarkers: true
        };
        directionsDisplay = new google.maps.DirectionsRenderer(renderOptions);
        directionsDisplay.setMap(map);
    }
    var route = directions.routes[0];
    var firstLeg = route.legs[0];
    var secondLeg = route.legs[1];

    directionsDisplay.setDirections(directions);

    var startMarker = new google.maps.Marker({
        map: map,
        position: firstLeg.start_location,
        title: "Start",
        label: "A"
    });
    var changeOver = new google.maps.Marker({
        map: map,
        position: secondLeg.start_location,
        title: "Bike Rack",
        label: "X"
    });
    var endMarker = new google.maps.Marker({
        map: map,
        position: secondLeg.end_location,
        title: "End",
        label: "B"
    });

    for (var i = 0; i < firstLeg.steps.length; i++) {
        var step = firstLeg.steps[i];
        $("#step-details").append('<div class="step">' + step.instructions + '</div>');
    }
    for (var i = 0; i < secondLeg.steps.length; i++) {
        var step = secondLeg.steps[i];
        $("#step-details").append('<div class="step">' + step.instructions + '</div>');
    }
}