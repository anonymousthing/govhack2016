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

function calculateAndDisplayRoute(start, end) {


    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);

    directionsService.route({
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}