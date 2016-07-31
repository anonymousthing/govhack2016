// Reference to the google map
var map;

// Reference to the directions render. So that we can clear and re-use it if start/end changes.
var cyclingDisplay;
var walkingDisplay;

// The set of markers rendered to the map.
var markers = [];

// The popup window that may be displayed on the map.
var infoWindow;

// The list bike racks retrieved from the server.
var bikeracks;

// The user-specified start and end search strings. 
var startLocation;
var endLocation;

// The drop-off racks available.
var availableDropOffPoints;

// The bicycle rack the user has decided to route through.
var selectedDropOffPoint;

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
    var candidateRacks = [];

    for (var i = 0; i < bikeracks.length; i++) {
        // Apply pythag to calculate delta for each bike rack in degrees lat/lng.
        var bikerack = bikeracks[i];
        var deltaLat = Math.abs(bikerack.Latitude - endLatLng.lat());
        var deltaLng = Math.abs(bikerack.Longitude - endLatLng.lng());
        bikerack.delta = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
        
        // Less than one degree lat/lng, which is quite a distance.
        if (bikerack.delta < 1) {
            candidateRacks.push(bikerack);
        }
    }

    // Now sort by the delta
    candidateRacks.sort(function (a, b) {
        return a.delta - b.delta;
    });

    // Return three with lowest deltas.
    return candidateRacks.slice(0, 3);
}

// Called whenever searches for a route from start -> end from the home screen.
function beginPlan(start, end) {
    startLocation = start;
    endLocation = end;

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ "address": end }, function (results, status) {
        if (status == 'OK') {
            var endLatLng = results[0].geometry.location;

            // Gets the nearest bike rack to the endpoint.
            availableDropOffPoints = getNearbyBikeRacks(endLatLng);
            
            // Bail.
            if (!availableDropOffPoints || availableDropOffPoints.length == 0 || !availableDropOffPoints[0].delta) {
                window.alert('No bike rack found near destination.');
                return;
            }

            // When first searching, default to the nearest rack.
            selectedDropOffPoint = availableDropOffPoints[0];

            // When first searching, default to the nearest rack.
            calculateAndDisplayRoute();
        }
    });
}

// Called when the user changes their drop-off point manually
function changeDropOffPoint(index) {
    selectedDropOffPoint = availableDropOffPoints[index];

    // Update the displayed route
    calculateAndDisplayRoute();
}

function calculateAndDisplayRoute() {
    var bicycleRack = new google.maps.LatLng(selectedDropOffPoint.Latitude, selectedDropOffPoint.Longitude);

    var responseCount = 0;
    var cyclingRoute = null; // Start to bicycle rack
    var walkingRoute = null; // Bicycle rack to End.

    var directionsService = new google.maps.DirectionsService;
    directionsService.route({
        origin: startLocation,
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
        destination: endLocation,
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
            displayRoute(cyclingRoute, walkingRoute);
        }
    }
}

function displayRoute(cyclingDirections, walkingDirections) {

    displayRouteLine(cyclingDirections, walkingDirections);

    var firstLeg = cyclingDirections.routes[0].legs[0];
    var secondLeg = walkingDirections.routes[0].legs[0];

    // Display route markers
    clearMarkers();
    placeRouteMarker(firstLeg.start_location, "A", "Start", '<h3>Start</h3>' + firstLeg.start_address);

    for (var i = 0; i < availableDropOffPoints.length; i++) {
        var dropOffPoint = availableDropOffPoints[i];
        var location = new google.maps.LatLng({ lat: dropOffPoint.Latitude, lng: dropOffPoint.Longitude });
        
        if (dropOffPoint === selectedDropOffPoint) {
            placeRouteMarker(location, "P", "Bike Rack", '<h3>Park your bicycle here</h3>' + dropOffPoint.Address);
        } else {
            placeRouteMarker(location, " ", "Bike Rack", '<h3>Alternative bicycle rack</h3>' + dropOffPoint.Address
                + '<div><a href="javascript:void(0);" onclick="changeDropOffPoint(' + i + ');">Route through here</a></div>');
        }
    }

    placeRouteMarker(secondLeg.end_location, "B", "End", '<h3>End</h3>' + secondLeg.end_address);

    var cyclingBounds = cyclingDirections.routes[0].bounds;
    var displayBounds = new google.maps.LatLngBounds(cyclingBounds.getSouthWest(), cyclingBounds.getNorthEast());
    displayBounds.union(walkingDirections.routes[0].bounds);
    map.fitBounds(displayBounds);

    // TODO: Place event markers
    placeMarker(-27.469, 153.023, {});

    var latlngs = [];

    // Update step details
    $("#step-details").html('');
    for (var i = 0; i < firstLeg.steps.length; i++) {
        var step = firstLeg.steps[i];
        latlngs.push({ latitude: step.start_location.lat(), longitude: step.start_location.lng() });
        $("#step-details").append('<div class="step"><div class="maneuver ' + step.maneuver + '"></div><div class="step-description">' + step.instructions + '</div></div>');
    }
    $.ajax("/api/event", {
        data: JSON.stringify(latlngs),
        dataType: "json",
        contentType: "application/json",
        method: "POST",
    }).done(function(data) {
        console.log(data);
    }).error(function (data) {
        console.log(data);
    });

    $("#step-details").append('<div class="step"><div class="maneuver"></div><div class="step-description">Park at the bicycle racks on <b>' + selectedDropOffPoint.Address + '</b></div></div>');
    for (var i = 0; i < secondLeg.steps.length; i++) {
        var step = secondLeg.steps[i];
        $("#step-details").append('<div class="step"><div class="maneuver ' + step.maneuver + '"></div><div class="step-description">' + step.instructions + '</div></div>');
    }
}

function displayRouteLine(cyclingDirections, walkingDirections) {

    if (!cyclingDisplay) {
        cyclingDisplay = new google.maps.DirectionsRenderer();
        cyclingDisplay.setMap(map);
        cyclingDisplay.setOptions({
            polylineOptions: { strokeColor: "#73B9FF", strokeWeight: 4, strokeOpacity: 0.8 },

            // We will draw our own markers.
            suppressMarkers: true,

            // Don't zoom in on this section. We do manual zooming.
            preserveViewport: true
        });
    }

    if (!walkingDisplay) {
        walkingDisplay = new google.maps.DirectionsRenderer();
        walkingDisplay.setMap(map);
        walkingDisplay.setOptions({
            polylineOptions: { strokeColor: "#75FF75", strokeWeight: 4, strokeOpacity: 0.8 },

            // We will draw our own markers.
            suppressMarkers: true,

            // Don't zoom in on the walking section. It is usually very small.
            preserveViewport: true
        });
    }

    cyclingDisplay.setDirections(cyclingDirections);
    walkingDisplay.setDirections(walkingDirections);
}

function placeRouteMarker(latLng, label, title, popupContent) {
    var marker = new google.maps.Marker({
        map: map,
        position: latLng,

        // Tooltip
        title: title,
        label: label
    });
    marker.addListener('click', function () {
        showInfoWindow(map, marker, popupContent);
    });
    markers.push(marker);
}

function placeMarker(latitude, longitude, data) {
    var location = new google.maps.LatLng({ lat: latitude, lng: longitude });
    var marker = new google.maps.Marker({
        map: map,
        position: location,

        // Tooltip
        title: "Event",
        label: ""
    });
    marker.addListener('click', function () {
        showInfoWindow(map, marker, "<h3>Title</h3>Event details here");
    });
    markers.push(marker);
}

function showInfoWindow(map, marker, content) {
    if (!infoWindow) infoWindow = new google.maps.InfoWindow();
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}