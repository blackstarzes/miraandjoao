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
    const galleryCarouselSelector = '#gallery-carousel';
    const scrollOptions = { behavior: 'smooth' };
    const playClass = 'play';
    const fullscreenClass = 'gallery-fullscreen';

    // Gallery index links
    $('.gallery-index-link').on('click', function(e) {
        let carousel = $(e.target).data('target');
        $(carousel).carousel(parseInt($(e.target).data('slide-to')));
        $(galleryCarouselSelector)[0].scrollIntoView(scrollOptions);
    });

    // Gallery controls
    let getIndex = function(offset) {
        // Get the current index
        let allIndexes = $('.gallery-index-link');
        let currentIndex = allIndexes.index($('.gallery-index-link.selected'));
        let targetIndex = (currentIndex + offset + allIndexes.length) % allIndexes.length;
        $(galleryCarouselSelector).carousel(parseInt($(allIndexes.get(targetIndex)).data('slide-to')));
        $(galleryCarouselSelector)[0].scrollIntoView(scrollOptions);
    };
    $('#gallery-control-previous-index').on('click', function(e) {
        $(galleryCarouselSelector).carousel(getIndex(-1));
    });
    $('#gallery-control-previous').on('click', function(e) {
        $(galleryCarouselSelector).carousel('prev');
        $(galleryCarouselSelector)[0].scrollIntoView(scrollOptions);
    });
    $('#gallery-control-play').on('click', function(e) {
        $('#gallery-carousel-container').addClass(playClass);
        $(galleryCarouselSelector).carousel('cycle');
        $(galleryCarouselSelector)[0].scrollIntoView(scrollOptions);
    });
    $('#gallery-control-pause').on('click', function(e) {
        $('#gallery-carousel-container').removeClass(playClass);
        $(galleryCarouselSelector).carousel('pause');
        $(galleryCarouselSelector)[0].scrollIntoView(scrollOptions);
    });
    $('#gallery-control-next').on('click', function(e) {
        $(galleryCarouselSelector).carousel('next');
        $(galleryCarouselSelector)[0].scrollIntoView(scrollOptions);
    });
    $('#gallery-control-next-index').on('click', function(e) {
        $(galleryCarouselSelector).carousel(getIndex(1));
    });
    $('#gallery-control-full-screen').on('click', function(e) {
        $('body').addClass(fullscreenClass);
        $('#gallery-carousel-container').addClass('fullscreen');
        $(galleryCarouselSelector)[0].scrollIntoView(scrollOptions);
    });
    $('#gallery-control-restore-screen').on('click', function(e) {
        $('body').removeClass(fullscreenClass);
        $('#gallery-carousel-container').removeClass('fullscreen');
        $(galleryCarouselSelector)[0].scrollIntoView(scrollOptions);
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
    let first = $(galleryCarouselSelector).find('div.carousel-item.active');
    lazyLoadLoaderImages(first.find('img.gallery-image-loader[data-src]'));
    lazyLoadViewImages(first.find('a.gallery-image-link'));
    lazyLoadLoaderImages(first.next().find('img.gallery-image-loader[data-src]'));
    $(galleryCarouselSelector).on('slid.bs.carousel', function(ev) {
        // Update the index in session storage
        sessionStorage.setItem(sessionStorageKey, ev.to);
        const target = $(ev.relatedTarget);

        // Update the download link
        const dl = $('#gallery-control-download');
        const original = target.find('.gallery-image-link').data('original');
        const dlPrefix = dl.data('download-prefix');
        const dlNumber = original.substring(original.lastIndexOf('-') + 1).replace('.jpg', '');
        const dlCategory = target.data('category').replace(' ', '-');
        dl.attr('href', original);
        dl.attr('download', `${dlPrefix}-${dlNumber}-${dlCategory}.jpg`);

        // Update the current gallery index
        let newCategory = target.data('category');
        let currentIndexElement = $('.gallery-index-link.selected');
        if (currentIndexElement.data('category') !== newCategory) {
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
        $(galleryCarouselSelector).carousel(parseInt(sessionTarget));
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
