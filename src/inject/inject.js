var widgetClass = "widgetClass";
var widgetContentClass = "widgetContentClass";


var queryGoogleId = "#lst-ib";//"#gbqfq";
var queryBingId = "#sb_form_q";
var queryYahooId = "#yschsp";


var searchEngineBeingUsed = undefined;
var pageLoadTime = 0;


/**
 * handler when the page is fully loaded
 */
$(document).ready(function() {
    var url = window.location.href;

    computePageLoadTime();
    TimeMe.setIdleDurationInSeconds(30);
    TimeMe.setCurrentPageName(url);

    TimeMe.initialize();


    $(window).unload(function() {
        TrackingSystem.logTimeOnPageAndScrolls();
    });


    //if it's google
    if(/^https?:\/\/www\.google\.\w{1,3}(\/.*)?/.test(url) && url.indexOf("newtab") == -1) {
        console.log("It's google here!");
        searchEngineBeingUsed = GOOGLE;

        //wait a bit, sometimes the search bar content isn't immediately available
        var xxx = 0;
        (function myLoop () {
            setTimeout(function () {
                var query = $(queryGoogleId).val();
                console.log("query " + xxx + ":" + query);
                if(!query)
                    myLoop();
                else
                    updateSearchQuery(query);
            }, 400)
        })();

        $(window).bind('hashchange', function() {
            var query = $(queryGoogleId).val();
            updateSearchQuery(query);
        });
    }
    //if it's bing
    else if (/^https?:\/\/www.bing\.\w{1,3}(\/.*)?/.test(url)) {
        console.log("It's bing here!");
        searchEngineBeingUsed = BING;


        setTimeout(function(){
            var query = $(queryBingId).val();
            updateSearchQuery(query);
        }, 400);

    }
    //if it's yahoo
    else if (/^https?:\/\/search.yahoo.com\/search(.*)/.test(url)) {
        console.log("It's yahoo here!");
        searchEngineBeingUsed = YAHOO;

        setTimeout(function(){
            var query = $(queryYahooId).val();
            console.log("query: " + query);
            updateSearchQuery(query);
        }, 400);

    }
    else //if it's another page ask background script if the widget should be inserted
        chrome.runtime.sendMessage({action: "ready"});

});


/**
 * handler for incoming messages from the background script
 */
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('new message: '+ JSON.stringify(request));
        if(!request.action)
        {
            console.log('invalid action',request);
            return;
        }

        switch(request.action) {

            case 'loadWidget':

                console.log("appending widget");

                if (!getWidget().length) {
                    console.log("**loading widget**");
                    loadWidget();
                } else {
                    console.log("**widget exists**");
                }

                if(request.logging === true) {
                    if(searchEngineBeingUsed != undefined) {

                        TrackingSystem.trackSearch( function () {
                            TrackingSystem.getSEResults(searchEngineBeingUsed);
                            TrackingSystem.trackPageView();
                            TrackingSystem.trackCopy();
                            TrackingSystem.trackFind();
                            TrackingSystem.trackScroll();
                            //TrackingSystem.trackClicks();
                            TrackingSystem.trackSERPClicks();
                            TrackingSystem.trackCopy();
                        });
                    }
                    else {
                        TrackingSystem.trackPageView();
                        TrackingSystem.trackCopy();
                        TrackingSystem.trackFind();
                        TrackingSystem.trackScroll();
                        TrackingSystem.trackClicks();
                        TrackingSystem.trackCopy();
                    }
                }

                chrome.runtime.sendMessage({action: 'loadData'});
                break;
            case 'setData':
                console.log("receiving result...: " + JSON.stringify(request));

                if(searchEngineBeingUsed == undefined)
                    searchEngineBeingUsed = request['data'][SEARCH_ENGINE];

                if (request.data.minimized) {
                    $(".widgetClass").css("bottom", "-190px");
                    getWidgetContent().find("#window-action-minimize").removeClass("icon-arrows-compress");
                    getWidgetContent().find("#window-action-minimize").removeClass("icon-arrows-expand");
                    getWidgetContent().find("#window-action-minimize").addClass("icon-arrows-expand");
                }
                updateSearchQuery(request['data'][SEARCH], false);
                setSuggestions(request['data'][SUGGESTION]);
                break;
            case 'closeWidget':
                widgetClose(false);
                break;
            default :
                break;
        }
    });


function updateSearchQuery(query, updateData) {
    updateData = (typeof updateData === "undefined") ? true : updateData;

    getWidgetContent().find('#query').text(query);
    updateEnginesUrls(query);

    //only when updating query in search engine's textinput
    if (updateData) {
        chrome.runtime.sendMessage({action: "getSuggestions", query: query, search_engine: searchEngineBeingUsed});
    }

    //getGoogleResults();
    //getBingResults();
    //getYahooResults()
}



function updateEnginesUrls(query) {
    if (query) {
        var splittedQuery = replaceAll(" ", "+", query);
        var google = G_GOOGLE_SEARCH_URL + splittedQuery;
        var bing = G_BING_SEARCH_URL + splittedQuery;
        var yahoo = G_YAHOO_SEARCH_URL + splittedQuery;

        var contents = getWidgetContent();

        contents.find("#icon-google").parent().attr("href", google);
        contents.find("#icon-bing").parent().attr("href", bing);
        contents.find("#icon-yahoo").parent().attr("href", yahoo);
    }
}

function setSuggestions(suggestions) {
    getWidgetContent().find('#suggestions *').remove();
    for(var i = 0; i < suggestions.length; i++) {
        var li = $("<li>");
        li.addClass("suggestion");

        li.html('<a data-suggestion-lang="'+  suggestions[i].lang +'" data-suggestion-type="' + suggestions[i].type +
            '" href="'+ SEARCH_URL[searchEngineBeingUsed] + replaceAll(" ", "+", suggestions[i].term) +  '" target="_top">'
            + suggestions[i].term + "</a>");

        getWidgetContent().find('#suggestions').append(li);
    }

}