$(function(){
    // Navigation
    let initNav = function() {
        $("a[href^='#']").click(function () {
            let sectionTo = $(this).attr('href');
            $('.navbar-collapse').collapse('hide');
            $('html, body').animate({
                scrollTop: $(sectionTo).offset().top
            }, 'slow');
        });
    };

    // Animation
    let initAnimation = function() {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out-sine',
        });
    }

    initNav();
    initAnimation();
});

// Maps
function initMaps() {
    let vilaVita = {lat: 37.101457, lng: -8.3824047, placeId: 'ChIJX4iNCUTRGg0RSrvhjFgQ3VE'};
    let ourLady = {lat: 37.1254143, lng: -8.4011588, placeId: 'ChIJ0UW4BtXWGg0R2XoubH9KSsk'};
    let places = [
        vilaVita,
        ourLady
    ]
    let map = new google.maps.Map($('#googleMap')[0], {
        center: {
            lat: places.reduce(function(a, b) { return a.lat + b.lat; })/places.length,
            lng: places.reduce(function(a, b) { return a.lng + b.lng; })/places.length,
        },
        zoom: 13
    });

    let vilaVitaMarker = new google.maps.Marker({position: vilaVita, map: map});
    let ourLadyMarker = new google.maps.Marker({position: ourLady, map: map});
}