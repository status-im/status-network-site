// All posts fetched will be pushed into this array
var allPosts = [];
    
// List of all blogs to fetch
var allBlogs = [
    {
        url: 'https://vac.dev/feed.xml',
        blog: 'vac',
        type: 'xml'
    },
    {
        url: 'https://our.status.im',
        key: '2abb4728e472593059746cc5e8',
        version: 'v2',
        limit: 3,
        blog: 'our-status',
        type: 'ghost'
    },
    {
        url: 'https://news.nimbus.team',
        key: '1785a1f63f60077dbe3156d1b5',
        version: 'v2',
        limit: 3,
        blog: 'nimbus',
        type: 'ghost'
    },
    {
        url: 'https://news.thestatus.network',
        key: '66d8d4f364b9f46c90c9d45bf4',
        version: 'v2',
        limit: 3,
        blog: 'status-network',
        type: 'ghost'
    },
    {
        url: 'https://embark.status.im/atom.xml',
        blog: 'embark',
        type: 'xml'
    }
];

$(document).ready(function () {

    // Get handlebars template
    var template;
    function getTemplate(){
        $.ajax({
            url: window.location.origin + '/template/loop.txt',
            type: 'GET',
        }).done(function(response) {
            template = response;
        });  
    }

    var storedPosts = store.get('sn_posts'),
        storedTemplate = store.get('sn_template');

    if(typeof storedPosts != 'undefined' && typeof storedTemplate != 'undefined'){

        // Load posts and template from localstorage
        for (const v of storedPosts) {
            renderPost(v, storedTemplate);
        }

    }else{

        var deferred,
            deferreds = [];
        
        // Fetch all posts
        deferred = getTemplate();
        deferreds.push(deferred);
    
        for (const v of allBlogs) {
            if(v.type == 'xml'){
                deferred = loadXMLPosts(v);
            }else if(v.type == 'ghost'){
                deferred = loadGhostPosts(v);
            }
            deferreds.push(deferred);
        }

        $.when.apply($, deferreds).done(function(t){

            allPosts.sort(function(a,b){
                return new Date(b.defaultDate) - new Date(a.defaultDate)
            });
            
            // store all posts and template for 6h
            store.set('sn_posts', allPosts, new Date().getTime() + 1000*60*60*6);
            store.set('sn_template', template, new Date().getTime() + 1000*60*60*6);

            for (const v of allPosts) {
                renderPost(v, template);
            }

        });

    }

    // Enable tilt effect for home products
    var tilt = $('.products .inner-img a').tilt({
        maxTilt: 5,
        scale: 1.02,
        glare: true,
        maxGlare: .3
    });

    // Make products navigation sticky
    $(".products-container .quick-nav").stick_in_parent();

    // Smooth scroll to specific section after click on quick nav link
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

    // Smooth scroll to specific section after click on about nav link
    $('.about-intro .inline-links a[href^="#"]').each(function (index, element) {
        $(this).on('click', function (event) {
            event.preventDefault();
            var id = $(this).attr('href');
            $('html, body').animate({
                scrollTop: $(id).offset().top
            }, 300);
        });
    });

    // Cancel click on links that are not launched yet
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

    // Enable parallax effect for status border logo
    var rellax = new Rellax('.floating-logo', {
        speed: -3,
    });

});

// Function to load posts from Ghost blog
function loadGhostPosts(arr){

    var ghostAPI = new GhostContentAPI({
        url: arr.url,
        key: arr.key,
        version: arr.version
    });

    return ghostAPI.posts
        .browse({
            include: 'authors',
            fields: ['title', 'url', 'published_at'],
            limit: arr.limit
        })
        .then(function(posts){

            for(const v of posts){
                var authors = '';
                for(const a of v.authors){
                    authors += a.name + ', ';
                }
                authors = authors.slice(0,-2);

                var date = moment(v.published_at, 'YYYY-MM-DDTHH:mm:ssZ').format('D MMMM YYYY');

                allPosts.push({
                    'title': v.title,
                    'url': v.url,
                    'date': date,
                    'defaultDate': v.published_at,
                    'authors': authors,
                    'blog': arr.blog
                });
            }

        })
        .catch(function(err){
            console.error(err);
        });
}

// Check if element is into view when scrolling
function isScrolledIntoView(elem){
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

// Function to load posts from Jekyll/Hexo blog
function loadXMLPosts(arr){
    return $.ajax({
        url: arr.url,
        type: 'GET',
        dataType: 'xml',
    })
    .done(function(response) {

        $(response).find('entry').each(function(){
            
            var title = $(this).find('title').text();
            var url = $(this).find('link').attr('href');
            var defaultDate = $(this).find('published').text();
            var date = moment(defaultDate, 'YYYY-MM-DDTHH:mm:ssZ').format('D MMMM YYYY');
            var authors = $(this).find('author name').text();
            var blog = arr.blog;

            allPosts.push({
                'title': title,
                'url': url,
                'date': date,
                'defaultDate': defaultDate,
                'authors': authors,
                'blog': blog
            });

        });

    });   
}

// Render post to push into list of posts
function renderPost(v, t){
    var r = Handlebars.compile(t);
    var c = r(v);
    $('.feed .list-posts').append('<li>' + c + '</li>');
}