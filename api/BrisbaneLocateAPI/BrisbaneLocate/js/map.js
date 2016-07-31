// Reference to the google map
var map;

// Reference to the directions render. So that we can clear and re-use it if start/end changes.
var walkingStartDisplay;
var cyclingDisplay;
var walkingEndDisplay;

// The set of markers rendered to the map.
var markers = [];

// The popup window that may be displayed on the map.
var infoWindow;

// The list bike racks retrieved from the server.
var bikeracks;
var citycycles;

// The user-specified start and end search strings. 
var startLocation;
var endLocation;
var useCityCycle;

// The geocoded start and end locations.
var startLatLng;
var endLatLng;

// The drop-off racks available.
var availableDropOffPoints;

// The pick-up racks available (citycycle only).
var availablePickUpPoints;

// The bicycle rack the user has decided to route through.
var selectedDropOffPoint;
var selectedPickUpPoint;

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
    // Bounds around Brisbane, to make autocomplete suggestions more helpful.
    var autocompleteOptions = {
        bounds: getBiasingBounds(),
        componentRestrictions: getComponentRestrictions()
    };
    var autocomplete = new google.maps.places.Autocomplete(textbox, autocompleteOptions);
    autocomplete.bindTo('bounds', map);
}

// The bounds that google should bias results towards. The Brisbane CDB. To be passed
// whenever we are autocompleting, searching, etc.
function getBiasingBounds() {
    var brisbane = {
        lat: -27.469, lng: 153.023
    };
    var circle = new google.maps.Circle({
        center: brisbane,
        radius: 2000 // 4km
    });
    return circle.getBounds();
}

function getComponentRestrictions() {
    // Restricts results to Australia
    return { country: "au" };
}

$(document).ready(function () {
    $.ajax("/api/bikerack").done(function (data) {
        bikeracks = data;
    });
    $.ajax("/api/citycycle").done(function (data) {
        citycycles = data;
    });
});

// Called by index.html to tell us #map is being shown.
function showMap() {
    if (map) {
        google.maps.event.trigger(map, 'resize');
    }
}

function getNearbyBikeRacks(racks, walkToLatLng, cycleFromLatLng) {
    // Delta measures distance between endpoint and bike rack in degrees lat/lng.
    var candidateRacks = [];

    for (var i = 0; i < racks.length; i++) {
        // Apply pythag to calculate delta for each bike rack in degrees lat/lng.
        var bikerack = racks[i];

        // Score bikerack by total 'as-the-bird-flies' distance going from start, through the rack
        // and to the destination. This should approximate total distance by road.
        // The distance to walk has thrice the cost of cycling.
        bikerack.score = calculateDelta(bikerack, walkToLatLng) * 3.0 + calculateDelta(bikerack, cycleFromLatLng);
        
        // Less than one degree lat/lng, which is quite a distance.
        if (bikerack.score < 100) {
            candidateRacks.push(bikerack);
        }
    }

    // Now sort by the score
    candidateRacks.sort(function (a, b) {
        return a.score - b.score;
    });

    // Return three with lowest deltas.
    return candidateRacks.slice(0, 3);
}

function calculateDelta(rack, latLng) {
    // Apply pythag
    var deltaLat = Math.abs(rack.Latitude - latLng.lat());
    var deltaLng = Math.abs(rack.Longitude - latLng.lng());
    return Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
}

// Called whenever searches for a route from start -> end from the home screen.
function beginPlan(start, end) {
    startLocation = start;
    endLocation = end;
    useCityCycle = false;
    
    // Geocode both the start and end locations, with bias towards Brisbane CBD.
    var pendingResponses = 2;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        address: end,
        componentRestrictions: getComponentRestrictions()
    }, function (results, status) {
        if (status == 'OK') {
            endLatLng = results[0].geometry.location;
            pendingResponses--;
            processGeocode();
        }
    });

    geocoder.geocode({
        address: start,
        componentRestrictions: getComponentRestrictions()
    }, function (results, status) {
        if (status == 'OK') {
            startLatLng = results[0].geometry.location;
            pendingResponses--;
            processGeocode();
        }
    });

    function processGeocode() {
        if (pendingResponses > 0) return;

        if (useCityCycle) {
            availablePickUpPoints = getNearbyBikeRacks(citycycles, startLatLng, endLatLng);
            availableDropOffPoints = getNearbyBikeRacks(citycycles, endLatLng, startLatLng);
        } else {
            // Gets the nearest bike rack to the endpoint.
            availablePickUpPoints = null;
            availableDropOffPoints = getNearbyBikeRacks(bikeracks, endLatLng, startLatLng);
        }

        // Bail.
        if (!availableDropOffPoints || availableDropOffPoints.length == 0 || !availableDropOffPoints[0].score) {
            window.alert('No suitable bike racks/CityCycles could be find. Try another origin or destination in Brisbane.');
            return;
        }
        if ((useCityCycle) && (!availablePickUpPoints || availablePickUpPoints.length == 0 || 
            !availablePickUpPoints[0].score)) {
            window.alert('No suitable CityCycles could be find. Try another origin or destination in Brisbane.');
            return;
        }

        // When first searching, default to the nearest rack/CityCycle.
        selectedDropOffPoint = availableDropOffPoints[0];

        if (useCityCycle) {
            selectedPickUpPoint = availablePickUpPoints[0];
        } else {
            selectedPickUpPoint = null;
        }

        // When first searching, default to the nearest rack.
        calculateAndDisplayRoute();
    }
}

// Called when the user changes their drop-off point manually
function changeDropOffPoint(index) {
    selectedDropOffPoint = availableDropOffPoints[index];

    // Update the displayed route
    calculateAndDisplayRoute();
}

function calculateAndDisplayRoute() {
    var dropOffRack = new google.maps.LatLng(selectedDropOffPoint.Latitude, selectedDropOffPoint.Longitude);
    var pickUpRack = startLocation;
    if (useCityCycle) {
        pickUpRack = new google.maps.LatLng(selectedPickUpPoint.Latitude, selectedPickUpPoint.Longitude);
    }

    var pendingResponses = (useCityCycle) ? 3 : 2;
    var initialWalkingRoute = null; // Start to pick-p
    var cyclingRoute = null; // Pick-up to drop-off
    var walkingRoute = null; // Bicycle rack to End.

    var directionsService = new google.maps.DirectionsService;

    if (useCityCycle) {
        directionsService.route({
            origin: startLocation,
            destination: pickUpRack,
            travelMode: 'WALKING'
        }, function (response, status) {
            if (status === 'OK') {
                pendingResponses--;
                initialWalkingRoute = response;
                processDirections();
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    directionsService.route({
        origin: pickUpRack,
        destination: dropOffRack,
        travelMode: 'BICYCLING'
    }, function (response, status) {
        if (status === 'OK') {
            pendingResponses--;
            cyclingRoute = response;
            processDirections();
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });

    directionsService.route({
        origin: dropOffRack,
        destination: endLocation,
        travelMode: 'WALKING'
    }, function (response, status) {
        if (status === 'OK') {
            pendingResponses--;
            walkingRoute = response;
            processDirections();
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });

    function processDirections() {
        if (pendingResponses === 0) {
            displayRoute(initialWalkingRoute, cyclingRoute, walkingRoute);
        }
    }
}

function displayRoute(walkingStartDirections, cyclingDirections, walkingEndDirections) {
    displayRouteLine(walkingStartDirections, cyclingDirections, walkingEndDirections);

    var firstLeg = cyclingDirections.routes[0].legs[0];
    var secondLeg = walkingEndDirections.routes[0].legs[0];

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
    displayBounds.union(walkingEndDirections.routes[0].bounds);
    map.fitBounds(displayBounds);

    // TODO: Place event markers
    placeMarker(-27.469, 153.023, {});

    var latlngs = [];
    var totalDistance = (firstLeg.distance.value + secondLeg.distance.value) / 1000;
    var totalTime = (firstLeg.duration.value + secondLeg.duration.value) / 60;

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

    $("#distance-details").html((Math.round(totalDistance * 10) / 10) + ' km');
    $("#time-details").html(Math.round(totalTime) + ' mins');
}

function displayRouteLine(walkingStartDirections, cyclingDirections, walkingEndDirections) {
    if (!walkingStartDisplay) {
        walkingStartDisplay = new google.maps.DirectionsRenderer();
        walkingStartDisplay.setOptions({
            polylineOptions: { strokeColor: "#75FF75", strokeWeight: 4, strokeOpacity: 0.8 },

            // We will draw our own markers.
            suppressMarkers: true,

            // Don't zoom in on the walking section. It is usually very small.
            preserveViewport: true
        });
    }

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

    if (!walkingEndDisplay) {
        walkingEndDisplay = new google.maps.DirectionsRenderer();
        walkingEndDisplay.setOptions({
            polylineOptions: { strokeColor: "#75FF75", strokeWeight: 4, strokeOpacity: 0.8 },

            // We will draw our own markers.
            suppressMarkers: true,

            // Don't zoom in on the walking section. It is usually very small.
            preserveViewport: true
        });
    }

    if (useCityCycle) {
        walkingStartDisplay.setMap(map);
        walkingStartDisplay.setDirections(walkingStartDirections);
    } else {
        walkingStartDisplay.setMap(null);
    }

    cyclingDisplay.setMap(map);
    walkingEndDisplay.setMap(map);

    cyclingDisplay.setDirections(cyclingDirections);
    walkingEndDisplay.setDirections(walkingEndDirections);
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