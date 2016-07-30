var initialHash = true;

var loadMap = function (from, destination, success, error) {
    window.location.hash = "#map";
    calculateAndDisplayRoute(from, destination);

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

    $("#go-button").on('click', function(e) {
        $(this).removeClass('fa-bicycle');
        $(this).addClass('fa-spinner');
        $(this).addClass('fa-pulse');

        loadMap($('#from-text').val(), $('#destination-text').val(), onMapLoadSuccess, onMapLoadError);
    });
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
    if (window.location.hash === "#map") {
        showMap();
    }
});

