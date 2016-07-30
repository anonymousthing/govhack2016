// Reference to the google map
var map;

// Reference to the directions render. So that we can clear and re-use it if start/end changes.
var cyclingDisplay;
var walkingDisplay;

// The list bike racks retrieved from the server.
var bikeracks;

// The set of markers rendered to the map.
var markers = [];

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
            var bicycleRack = new google.maps.LatLng(nearestRack.Latitude, nearestRack.Longitude);

            var responseCount = 0;
            var cyclingRoute = null; // Start to bicycle rack
            var walkingRoute = null; // Bicycle rack to End.

            var directionsService = new google.maps.DirectionsService;
            directionsService.route({
                origin: start,
                destination: bicycleRack,
                travelMode: 'BICYCLING'
            }, function (response, status) {
                if (status === 'OK') {
                    responseCount++;
                    cyclingRoute = response;
                    processDirections();
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });

            directionsService.route({
                origin: bicycleRack,
                destination: end,
                travelMode: 'WALKING'
            }, function (response, status) {
                if (status === 'OK') {
                    responseCount++;
                    walkingRoute = response;
                    processDirections();
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });

            function processDirections() {
                if (responseCount == 2) {
                    displayRoute(cyclingRoute, walkingRoute, nearestRack);
                }
            }
        }
    });
}

function displayRoute(cyclingDirections, walkingDirections, rack) {
    
    var firstLeg = cyclingDirections.routes[0].legs[0];
    var secondLeg = walkingDirections.routes[0].legs[0];

    if (!cyclingDisplay) {
        cyclingDisplay = new google.maps.DirectionsRenderer();
        cyclingDisplay.setMap(map);
        cyclingDisplay.setOptions({
            polylineOptions: { strokeColor: "#73B9FF", strokeWeight: 4, strokeOpacity: 0.8 },

            // We will draw our own markers.
            suppressMarkers: true
        });
    }

    if (!walkingDisplay) {
        walkingDisplay = new google.maps.DirectionsRenderer();
        walkingDisplay.setMap(map);
        walkingDisplay.setOptions({
            polylineOptions: { strokeColor: "#75FF75", strokeWeight: 4, strokeOpacity: 0.8 },

            // We will draw our own markers.
            suppressMarkers: true,

            // Don't zoom in on this!
            preserveViewport: true,
        });
    }

    cyclingDisplay.setDirections(cyclingDirections);
    walkingDisplay.setDirections(walkingDirections);

    clearMarkers();
    markers.push(new google.maps.Marker({
        map: map,
        position: firstLeg.start_location,
        title: "Start",
        label: "A"
    }));    
    markers.push(new google.maps.Marker({
        map: map,
        position: secondLeg.start_location,
        title: "Bike Rack",
        label: "P"
    }));
    markers.push(new google.maps.Marker({
        map: map,
        position: secondLeg.end_location,
        title: "End",
        label: "B"
    }));

    // TODO: Place event markers
    placeMarker(-27.469, 153.023, {});

    // Update step details
    $("#step-details").html('');
    for (var i = 0; i < firstLeg.steps.length; i++) {
        var step = firstLeg.steps[i];
        $("#step-details").append('<div class="step">' + step.instructions + '</div>');
    }
    $("#step-details").append('<div class="step">Park at the bicycle racks on <b>' + rack.Address + '</b></div>');
    for (var i = 0; i < secondLeg.steps.length; i++) {
        var step = secondLeg.steps[i];
        $("#step-details").append('<div class="step">' + step.instructions + '</div>');
    }
}

function placeMarker(latitude, longitude, data) {
    var location = new google.maps.LatLng({ lat: latitude, lng: longitude });
    markers.push(new google.maps.Marker({
        map: map,
        position: location,
        title: "Event",
        label: ""
    }));
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}