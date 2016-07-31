var initialHash = true;

var loadMap = function (success, error) {
    var isPrivateBike = $("#citycycle-checkbox").prop('checked');
    if (beginPlan(!isPrivateBike)) {
        window.location.hash = "#map";
    }
    
    var goButton = $("#go-button");
    goButton.removeClass('fa-spinner');
    goButton.removeClass('fa-pulse');
    goButton.addClass('fa-bicycle');
};

var onMapLoadSuccess = function(data) {
};

var onMapLoadError = function(data) {
    alert(data.message);
};

var resizeElements = function () {
    var bottom = $("#content-home").offset().top + $("#content-home").outerHeight(true);
    $("#bg-image").height(Math.max(window.innerHeight, bottom));
    $("#map").height(window.innerHeight * 0.7);
};

window.onload = function () {
    window.location.hash = '#home';
    
    //else if (window.location.hash == '') {
    //    window.location.hash = '#home';
    //} else {
    //    initialHash = false;
    //    $(window).trigger('hashchange');
    //}

    $("#go-button-wrapper").on('click', function (e) {
        var goButton = $("#go-button");
        goButton.removeClass('fa-bicycle');
        goButton.addClass('fa-spinner');
        goButton.addClass('fa-pulse');

        loadMap(onMapLoadSuccess, onMapLoadError);
    });

    resizeElements();
};

$(window).on('resize', function (e) {
    resizeElements();
});

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
    if (window.location.hash === "#map") {
        showMap();
    }
});

