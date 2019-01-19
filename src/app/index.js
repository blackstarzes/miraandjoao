$(function(){
    // Navigation
    let initNav = function() {
        $('.navbar-nav li.nav-item a').click(function () {
            let sectionTo = $(this).attr('href');
            $('html, body').animate({
                scrollTop: $(sectionTo).offset().top
            }, 'slow');
        });
    };

    initNav();
});