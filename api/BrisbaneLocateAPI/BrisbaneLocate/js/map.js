var map;

// Needs to be in global scope so that Google maps can do a callback.
function initMap() {
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
}

function showMap() {
    if (map) {
        google.maps.event.trigger(map, 'resize');
    }
}