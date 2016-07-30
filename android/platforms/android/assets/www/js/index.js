/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var resizeShowcaseVid = function() {
    var minWidth = $('#content-home').width();
    var minHeight= $('#content-home').height();

    var hScaled = minWidth * 9 / 16;
    var wScaled = minHeight * 16 / 9;

    var w = wScaled;
    var h = hScaled;
    if (wScaled < minWidth)
        w = minWidth;
    if (hScaled < minHeight)
        h = minHeight;
    
    $('#showcase-video').width(w);
    $('#showcase-video').height(h);
};

var initialHash = true;

var loadMap = function(from, destination, success, error) {
    var data = {
        message: "A timeout occurred. Please wait and try again."
    };

    setTimeout(function() { error(data) }, 1000);
};

var onMapLoadSuccess = function(data) {

};

var onMapLoadError = function(data) {
    var goButton = $("#go-button i");
    goButton.removeClass('fa-spinner');
    goButton.removeClass('fa-pulse');
    goButton.addClass('fa-arrow-right');

    alert(data.message);
};

window.onload = function() {
    if (window.location.hash == '#home') {
        initialHash = false;
    } else if (window.location.hash == '') {
        window.location.hash = '#home';
    } else {
        initialHash = false;
        $(window).trigger('hashchange');
    }

    resizeShowcaseVid();

    $("#go-button i").on('click', function(e) {
        $(this).removeClass('fa-arrow-right');
        $(this).addClass('fa-spinner');
        $(this).addClass('fa-pulse');

        loadMap($('#from-text').val(), $('#destination-text').val(), onMapLoadSuccess, onMapLoadError);
    });
};

window.onresize = function() {
    resizeShowcaseVid();
};

$(window).on('hashchange', function(e) {
    e.preventDefault();
    if (initialHash) {
        initialHash = false;
        return;
    }
    if (window.location.hash) {
        var target = window.location.hash.substring(1);
        target = '#content-' + target;

        $('.current').fadeOut(200);
        $('.current').removeClass('current');
        $(target).fadeIn(200);
        $(target).addClass('current');
    }
});

app.initialize();