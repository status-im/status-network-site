$(document).ready(function () {

    var tilt = $('.products .inner-img a').tilt({
        maxTilt: 5,
        scale: 1.02,
        glare: true,
        maxGlare: .3
    });

    $(".products-container .quick-nav").stick_in_parent();

    $('.quick-nav a').each(function (index, element) {
        $(this).on('click', function (event) {
            event.preventDefault();
            var id = $(this).attr('href');
            $('html, body').animate({
                scrollTop: $(id).offset().top
            }, 300);
            $('.quick-nav a').removeClass('active');
            $(this).addClass('active');
        });
    });

    $('.about-intro .inline-links a[href^="#"]').each(function (index, element) {
        $(this).on('click', function (event) {
            event.preventDefault();
            var id = $(this).attr('href');
            $('html, body').animate({
                scrollTop: $(id).offset().top
            }, 300);
        });
    });

    $('.products .inner-img .soon').each(function (index, element) {
        $(this).on('click', function (event) {
            event.preventDefault();
        });
    });

    $(window).on('scroll', function(event) {

        $('.in-view').each(function (index, element) {
            if (isScrolledIntoView($(this))){
                $('.quick-nav a').removeClass('active');
                $('.quick-nav a[href="#'+ $(this).attr('data-target') +'"]').addClass('active');
            }
        });

    });

    var rellax = new Rellax('.floating-logo', {
        speed: -3,
    });

    // Check if element is into view when scrolling
    function isScrolledIntoView(elem){
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

});