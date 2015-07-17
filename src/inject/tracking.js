// Inspired in common-web
// https://github.com/keen/common-web

(function() {
    var options = {
        pageviewsEventName: "pageviews",
        clicksEventName: "clicks",
        globalProperties: {
            page_url: window.location.href,
            referrer_url: document.referrer
        }
    };

    // create a common namespace with options
    var TrackingSystem = {
        options: options
    };

    TrackingSystem.addGlobalProperties = function(properties) {
        $.extend(TrackingSystem.options.globalProperties, properties);
    };



    TrackingSystem.trackSession = function(callback) {
        console.log("TrackingSystem.trackSession ");
        chrome.storage.local.get('healthSuggestions_guid', function(result) {
            var guid = null
            console.log("->" + JSON.stringify(result));
            if ($.isEmptyObject((result))) {
                console.log("Generating guid..")

                var genSub = function () {
                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                }

                guid = genSub() + genSub() + "-" + genSub() + "-" +
                    genSub() + "-" + genSub() + "-" + genSub() + genSub() + genSub();


                chrome.storage.local.set({'healthSuggestions_guid': guid});
            }
            else {
                guid = result['healthSuggestions_guid'];
            }

            console.log("guid: " + guid);


            TrackingSystem.addGlobalProperties({'guid': guid});

            if (typeof(callback) === "function")
                callback(guid);
        });


    };

    TrackingSystem.trackPageView = function () {

        var defaultProperties = TrackingSystem.options.globalProperties;
        var properties = $.extend(true, {}, defaultProperties);

        //CommonWeb.Callback(CommonWeb.options.pageviewsEventName, properties);

        console.log(TrackingSystem.options.pageviewsEventName + ": " + JSON.stringify(properties));

    };

    TrackingSystem.trackCopy = function () {
        $(document).bind('copy', function(e) {
            var t = '';
            if(window.getSelection){
                t = window.getSelection();
            }else if(document.getSelection){
                t = document.getSelection();
            }else if(document.selection){
                t = document.selection.createRange().text;
            }
            console.log('copy: "' + t + '"');

        });
    };

    // no way to know what user is finding
    TrackingSystem.trackFind = function () {
        var keydown = null;

        $(window).keydown(function(e) {
            if ( ( e.keyCode == 70 && ( e.ctrlKey || e.metaKey ) ) ||
                ( e.keyCode == 191 ) ) {
                keydown = new Date().getTime();
            }

            return true;
        }).blur(function() {
            if ( keydown !== null ) {
                var delta = new Date().getTime() - keydown;
                if ( delta >= 0 && delta < 1000 )
                    console.log('finding...');

                keydown = null;
            }
        });
    };

    TrackingSystem.trackScroll = function() {
        window.onscroll = function (e) {
            console.log("scroll");
        }
    };


    TrackingSystem.logSuggestionBoard = function(action) {
        console.log("logSuggestionBoard: " + action);
    };

    TrackingSystem.trackClicks = function() {
        /*  $("a").click(function(e) {
         console.log("___>" + $(this).text());
         console.log("___>" + $(this).text());


         console.log("clicking! ->>" + e.timeStamp + " - " + e.which + " -- "+" --- " + e.target.nodeName);
         });*/
    };

    TrackingSystem.trackSERPClicks = function() {
        //bing, google, yahoo
        $("ol#b_results > li.b_algo > div.b_title > h2 > a, div.srg > li h3.r a, .dd.algo div.compTitle > h3.title > a").on('click',function(e){
            var title = $(this).text();
            var url = $(this).attr("href");

            if (url.indexOf('http://r.search.yahoo.com/') === 0) {
                console.log($(this).parent().tagName);
                console.log($(this).parent().parent().attr("class"));
                url = $(this).parent().parent().find("div > span.wr-bw").text();
            }
            console.log("trackSERPClicks (Results): " + title + " -> " + url + " - " + e.which);
        });

        //bing, bing, google, yahoo
        $("ol#b_context ul.b_vList > li > a, div.b_rs > div.b_rich > div.b_vlist2col > ul > li > a, " +
            "div#brs > div > div > p > a," +
            "div.dd.AlsoTry > table tr > td > a").on('click', function() {

            console.log("trackSERPClicks (Suggestions): " + $(this).text());
        });
    };

    TrackingSystem.logPanelSuggestions = function(text) {
        console.log("trackPanelSuggestions: " + text);

    };





    window.TrackingSystem = TrackingSystem;
})();