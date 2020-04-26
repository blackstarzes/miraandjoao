const apiHost = "https://api.miraandjoao.com";

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
        let timer = setInterval(function() {
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
    initGallery();
});

function applyTemplate(content, tokens) {
    for (let prop in tokens) {
        if (tokens.hasOwnProperty(prop)) {
            content = content.replace(new RegExp(`<%= ${prop} %>`, "g"), tokens[prop]);
        }
    }
    return content;
}

function initGallery() {
    const sessionStorageKey = 'galleryIndex';

    // Gallery index links
    $('.gallery-index-link').on('click', function(e) {
        let carousel = $(e.target).data('target');
        $(carousel).carousel(parseInt($(e.target).data('slide-to')));
    });

    // Lazy-loading
    let lazyLoadLoaderImages = function(lazy) {
        lazy.attr('src', lazy.data('loader'));
        lazy.removeAttr('data-loader');
    };
    let lazyLoadViewImages = function(aElement) {
        let loader = aElement.find('img.gallery-image-loader');
        let img = new Image();
        img.src = loader.data('src');
        img.srcset = loader.data('srcset');
        img.sizes = loader.data('sizes');
        img.alt = loader.attr('alt');
        img.className = 'gallery-image gallery-image-view reveal';
        let addImg = function() {
            aElement.append(img).on('animationend webkitAnimationEnd oAnimationEnd', function(e) {
                loader.remove();
                $(e.target).removeClass('reveal');
            });
        }
        if (img.complete) addImg();
        else img.onload = addImg;
    }
    let first = $('#gallery-carousel').find('div.carousel-item.active');
    lazyLoadLoaderImages(first.find('img.gallery-image-loader[data-src]'));
    lazyLoadViewImages(first.find('a.gallery-image-link'));
    lazyLoadLoaderImages(first.next().find('img.gallery-image-loader[data-src]'));
    $('#gallery-carousel').on('slid.bs.carousel', function(ev) {
        // Update the index in session storage
        sessionStorage.setItem(sessionStorageKey, ev.to);
        const target = $(ev.relatedTarget);

        // Update the current gallery index
        let newCategory = target.attr('data-category');
        let currentIndexElement = $('.gallery-index-link.selected');
        if (currentIndexElement.attr('data-category') !== newCategory) {
            currentIndexElement.removeClass('selected');
            $('.gallery-index-link[data-category="' + newCategory + '"]').addClass('selected');
        }

        // Lazy-load images
        lazyLoadLoaderImages(target.find('img.gallery-image-loader[data-src]'));
        lazyLoadViewImages(target.find('a.gallery-image-link'));
        lazyLoadLoaderImages(target.next().find('img.gallery-image-loader[data-src]'));
    });

    // Reload the previous image position
    let sessionTarget = sessionStorage.getItem(sessionStorageKey);
    if (sessionTarget) {
        $('#gallery-carousel').carousel(parseInt(sessionTarget));
    }
}

// Maps
function initMaps() {
    let vilaVita = {lat: 37.101457, lng: -8.380216, placeId: 'ChIJX4iNCUTRGg0RSrvhjFgQ3VE', image: '/img/reception-map-icon.png'};
    let ourLady = {lat: 37.1254143, lng: -8.3989701, placeId: 'ChIJ0UW4BtXWGg0R2XoubH9KSsk', image: '/img/ceremony-map-icon.png'};
    let places = [
        vilaVita,
        ourLady
    ];
    let center = {
        lat: places.reduce(function(a, b) { return a.lat + b.lat; })/places.length,
        lng: places.reduce(function(a, b) { return a.lng + b.lng; })/places.length,
    };
    let portugalBounds = {
        north: 42,
        south: 37,
        west: -10,
        east: -5,
    };

    // Set up map
    let map = new google.maps.Map($('#googleMap')[0], {
        center: center,
        restriction: {
            latLngBounds: portugalBounds,
            strictBounds: false,
        },
        zoom: 13
    });

    // Set up markers
    let vilaVitaMarker = new google.maps.Marker({
        position: vilaVita,
        map: map,
        icon: {
            url: vilaVita.image,
            size: new google.maps.Size(32, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(32, 0)
        }
    });
    let ourLadyMarker = new google.maps.Marker({
        position: ourLady,
        map: map,
        icon: {
            url: ourLady.image,
            size: new google.maps.Size(32, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(32, 0)
        }
    });
    vilaVitaMarker.addListener('click', function() {
        window.open("https://www.google.com/maps/search/?api=1&query=Vila+Vita+Parc,+Porches,+Portugal", "_blank");
    });
    ourLadyMarker.addListener('click', function() {
        window.open("https://www.google.com/maps/search/?api=1&query=Church+of+Our+Lady+of+the+Incarnation,+Porches,+Portugal", "_blank");
    });
}
