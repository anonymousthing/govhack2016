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

// The autocomplete-enabled search boxes
var startAutocomplete;
var endAutocomplete;

// The list bike racks retrieved from the server.
var bikeracks;
var citycycles;

// The user-specified start and end search strings. 
var startLocation;
var endLocation;
var useCityCycle;

// Wether the map has been sized to the route yet.
var mapSized;

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

    var bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);

    // Set-up place autocomplete
    startAutocomplete = setupPlaceAutocomplete($("#from-text")[0]);
    endAutocomplete = setupPlaceAutocomplete($("#destination-text")[0]);
}

function setupPlaceAutocomplete(textbox) {
    // Bounds around Brisbane, to make autocomplete suggestions more helpful.
    var autocompleteOptions = {
        bounds: getBiasingBounds(),
        componentRestrictions: getComponentRestrictions()
    };
    var autocomplete = new google.maps.places.Autocomplete(textbox, autocompleteOptions);
    autocomplete.bindTo('bounds', map);
    return autocomplete;
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
function beginPlan(cityCycle) {
    var startPlace = startAutocomplete.getPlace();
    var endPlace = endAutocomplete.getPlace();

    if (!endPlace || !endPlace.geometry || !endPlace.geometry.location
        || !startPlace || !startPlace.geometry || !startPlace.geometry.location) {
        // User has not selected a place somewhere.
        return false;
    }

    startLocation = { placeId: startPlace.place_id };
    endLocation = { placeId: endPlace.place_id };
    useCityCycle = cityCycle;
    mapSized = false;
        
    var startLatLng = startPlace.geometry.location;
    var endLatLng = endPlace.geometry.location;

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
    return true;
}

// Called when the user changes their drop-off point manually
function changeDropOffPoint(index) {
    selectedDropOffPoint = availableDropOffPoints[index];

    // Update the displayed route
    calculateAndDisplayRoute();
}

// Called when the user changes their drop-off point manually
function changePickUpPoint(index) {
    selectedPickUpPoint = availablePickUpPoints[index];

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

function toShortTimeString(date) {
    var hours = date.getHours();
    var pm = hours >= 12;
    var ampmString = pm ? "PM" : "AM";
    if (hours > 12)
        hours = hours - 12;

    return hours + ":" + date.getMinutes() + " " + ampmString;
}

function displayRoute(walkingStartDirections, cyclingDirections, walkingEndDirections) {
    displayRouteLine(walkingStartDirections, cyclingDirections, walkingEndDirections);

    var walkingStartLeg = (useCityCycle) ? walkingStartDirections.routes[0].legs[0] : null;
    var cycleLeg = cyclingDirections.routes[0].legs[0];
    var walkingEndLeg = walkingEndDirections.routes[0].legs[0];

    // Display route markers
    clearMarkers();

    var firstLeg = (useCityCycle) ? walkingStartLeg : cycleLeg;
    placeRouteMarker(firstLeg.start_location, "A", "Start", '<h3>Start</h3>' + firstLeg.start_address);

    var facilityName = (useCityCycle) ? "CityCycle Station" : "bicycle rack";
    var dropOffTitle = (useCityCycle) ? "Return your CityCycle here" : "Park your bicycle here";
    
    for (var i = 0; i < availableDropOffPoints.length; i++) {
        var dropOffPoint = availableDropOffPoints[i];
        var location = new google.maps.LatLng({ lat: dropOffPoint.Latitude, lng: dropOffPoint.Longitude });
        
        if (dropOffPoint === selectedDropOffPoint) {
            placeRouteMarker(location, "R", facilityName, '<h3>' + dropOffTitle + '</h3>' + dropOffPoint.Address);
        } else {
            placeRackMarker(location, facilityName, '<h3>Alternative ' + facilityName + '</h3>' + dropOffPoint.Address
                + '<div><a href="javascript:void(0);" onclick="changeDropOffPoint(' + i + ');">Use this ' + facilityName + '</a></div>');
        }
    }

    if (useCityCycle) {
        for (var i = 0; i < availablePickUpPoints.length; i++) {
            var pickUpPoint = availablePickUpPoints[i];
            var location = new google.maps.LatLng({ lat: pickUpPoint.Latitude, lng: pickUpPoint.Longitude });

            if (pickUpPoint === selectedPickUpPoint) {
                placeRouteMarker(location, "P", facilityName, '<h3>Pick-up your CityCycle here</h3>' + pickUpPoint.Address);
            } else {
                placeRackMarker(location, facilityName, '<h3>Alternative ' + facilityName + '</h3>' + pickUpPoint.Address
                    + '<div><a href="javascript:void(0);" onclick="changePickUpPoint(' + i + ');">Use this ' + facilityName + '</a></div>');
            }
        }
    }

    placeRouteMarker(walkingEndLeg.end_location, "B", "End", '<h3>End</h3>' + walkingEndLeg.end_address);

    if (!mapSized) {
        var displayBounds = new google.maps.LatLngBounds();
        if (useCityCycle) displayBounds = displayBounds.union(walkingStartDirections.routes[0].bounds);
        displayBounds = displayBounds.union(cyclingDirections.routes[0].bounds);
        displayBounds = displayBounds.union(walkingEndDirections.routes[0].bounds);
        map.fitBounds(displayBounds);
        mapSized = true;
    }

    // TODO: Place event markers
    placeMarker(-27.469, 153.023, {});

    var latlngs = [];
    var totalDistance = ((useCityCycle ? walkingStartLeg.distance.value : 0) + cycleLeg.distance.value + walkingEndLeg.distance.value) / 1000;
    var totalTime = ((useCityCycle ? walkingStartLeg.duration .value : 0) + cycleLeg.duration.value + walkingEndLeg.duration.value) / 60;

    // Update step details
    $("#step-details").html('');
    if (useCityCycle) {
        displaySteps(walkingStartLeg);
        $("#step-details").append('<div class="step"><div class="maneuver rack"></div><div class="step-description">Pick-up your CityCycle from <b>' + selectedPickUpPoint.Address + '</b></div></div>');
    }

    var latlngs = displaySteps(cycleLeg);
    $("#distance-details").html((Math.round(totalDistance * 10) / 10) + ' km');
    $("#time-details").html(Math.round(totalTime) + ' mins');

    $.ajax("/api/event", {
        data: JSON.stringify(latlngs),
        dataType: "json",
        contentType: "application/json",
        method: "POST",
    }).done(function (data) {
        console.log("Loaded " + data.length + " events");
        for (var i = 0; i < data.length; i++) {
            var event = data[i];
            var popupData = {
                title: event.Title,
                description: event.Address + "<br />" + event.Description
            };
            placeMarker(event.Latitude, event.Longitude, popupData);
        }
    }).error(function (data) {
        console.log(data);
    });

    var returnDescription = (useCityCycle) ? 'Return your CityCycle to ' : 'Park at the bicycle racks on ';
    $("#step-details").append('<div class="step"><div class="maneuver rack"></div><div class="step-description">' + returnDescription + '<b>' + selectedDropOffPoint.Address + '</b></div></div>');
    displaySteps(walkingEndLeg);
}

function displaySteps(leg) {
    var latlngs = [];
    for (var i = 0; i < leg.steps.length; i++) {
        var step = leg.steps[i];
        latlngs.push({ latitude: step.start_location.lat(), longitude: step.start_location.lng() });
        $("#step-details").append('<div class="step"><div class="maneuver ' + step.maneuver + '"></div><div class="step-description">' + step.instructions + '</div></div>');
    }

    return latlngs;
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

function placeRackMarker(latLng, title, popupContent) {
    var marker = new google.maps.Marker({
        map: map,
        position: latLng,

        // Tooltip
        title: title,
        icon: "Media/rack-marker.png"
    });
    marker.addListener('click', function () {
        showInfoWindow(map, marker, popupContent);
    });
    markers.push(marker);
}

/*
data {
    title: '',
    description: ''
}
*/
function placeMarker(latitude, longitude, data) {
    var location = new google.maps.LatLng({ lat: latitude, lng: longitude });
    var marker = new google.maps.Marker({
        map: map,
        position: location,

        // Tooltip
        title: data.title,
        label: ""
    });
    marker.addListener('click', function () {
        showInfoWindow(map, marker, "<h3>" + data.title + "</h3>" + data.description);
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