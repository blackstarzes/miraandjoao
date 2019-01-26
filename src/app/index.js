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
    };

    // Countdown
    let initCountdown = function() {
        const secondsInMinute = 60;
        const secondsInHour = secondsInMinute*60;
        const secondsInDay = secondsInHour*24;
        const targetDate = moment.tz("2019-10-11 14:00", "Europe/Lisbon").utc();
        const localTimezone = moment.tz.guess(true);
        var timer = setInterval(function() {
            let now = moment().tz(localTimezone).utc();
            if (now < targetDate) {
                const delta = targetDate.diff(now, 'seconds');
                //console.log(delta);
                const days = Math.floor(delta/secondsInDay);
                const hours = Math.floor((delta - (days*secondsInDay))/secondsInHour);
                const minutes = Math.floor((delta - (days*secondsInDay) - (hours*secondsInHour))/secondsInMinute);
                const seconds = Math.floor(delta - (days*secondsInDay) - (hours*secondsInHour) - (minutes*secondsInMinute));

                $('#countdown-days').html(days);
                $('#countdown-hours').html(hours);
                $('#countdown-minutes').html(minutes);
                $('#countdown-seconds').html(seconds);
            } else {
                clearInterval(timer);

                $('#countdown-days').html('00');
                $('#countdown-hours').html('00');
                $('#countdown-minutes').html('00');
                $('#countdown-seconds').html('00');
            }
        }, 1000);
    };

    initNav();
    initAnimation();
    initCountdown();
});

/*
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
}*/
