$(function(){
    // Navigation
    let initNav = function() {
        $("a[href^='#']").click(function () {
            let sectionTo = $(this).attr('href');
            $('html, body').animate({
                scrollTop: $(sectionTo).offset().top
            }, 'slow');
        });
    };

    initNav();
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out-sine',
    });
});