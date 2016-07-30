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