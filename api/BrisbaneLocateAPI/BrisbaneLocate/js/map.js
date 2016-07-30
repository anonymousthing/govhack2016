var map;
var bikeracks;

// Needs to be in global scope so that Google maps can do a callback.
// Called after google maps JS is loaded.
function initMap() {
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });

    // Set-up place autocomplete
    setupPlaceAutocomplete($("#from-text")[0]);
    setupPlaceAutocomplete($("#destination-text")[0]);
}

function setupPlaceAutocomplete(textbox) {
    var autocomplete = new google.maps.places.Autocomplete(textbox);
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
            var directionsDisplay = new google.maps.DirectionsRenderer;
            directionsDisplay.setMap(map);

            directionsService.route({
                origin: start,
                destination: end,
                waypoints: waypoints,
                travelMode: 'DRIVING'
            }, function (response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }
    });


}