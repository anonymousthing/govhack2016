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