var widgetClass = "widgetClass";
var widgetContentClass = "widgetContentClass";


var queryGoogleId = "#lst-ib";//"#gbqfq";
var queryBingId = "#sb_form_q";
var queryYahooId = "#yschsp";

var G_GOOGLE_BASE_URL = "https://www.google.com/search?q=";
var G_BING_BASE_URL = "https://www.bing.com/search?q=";
var G_YAHOO_BASE_URL = "https://search.yahoo.com/search?p=";



/**
 * handler when the page is fully loaded
 */
$(document).ready(function() {
    var url = window.location.href;
    /*
     CommonWeb.Callback = function(collection, properties, callback) {
     console.log("collectin: " + collection);
     console.log("properties: " + JSON.stringify(properties));
     };

     CommonWeb.trackClicks();
     */

    //if it's google
    if(/^https?:\/\/www\.google\.\w{1,3}(\/.*)?/.test(url) && url.indexOf("newtab") == -1) {
        console.log("It's google here!");
        //loadWidget();
        //chrome.runtime.sendMessage({action: "createEntry"});

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

        //handle search changes
        /*$(queryGoogleId).on("input propertychange paste change", function() {
            var query = $(queryGoogleId).val();
            updateSearchQuery(query);
        });*/
        $(window).bind('hashchange', function() {
            var query = $(queryGoogleId).val();
            updateSearchQuery(query);
        });
    }
    //if it's bing
    else if (/^https?:\/\/www.bing\.\w{1,3}(\/.*)?/.test(url)) {
        console.log("It's bing here!");
        //loadWidget();
        //chrome.runtime.sendMessage({action: "createEntry"});

        setTimeout(function(){
            var query = $(queryBingId).val();
            updateSearchQuery(query);
        }, 400);

    }
    //if it's yahoo
    else if (/^https?:\/\/search.yahoo.com\/search(.*)/.test(url)) {
        console.log("It's yahoo here!");
        //loadWidget();
        //chrome.runtime.sendMessage({action: "createEntry"});

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

                chrome.runtime.sendMessage({action: 'loadData'});
                break;
            case 'setData':
                //TODO: very dependent of background js CONSTANTS, FIX IT
                console.log("receiving result...: " + JSON.stringify(request));


                if (request.data.minimized) {
                    $(".widgetClass").css("bottom", "-190px");
                    getWidgetContent().find("#window-action-minimize").removeClass("icon-arrows-compress");
                    getWidgetContent().find("#window-action-minimize").removeClass("icon-arrows-expand");
                    getWidgetContent().find("#window-action-minimize").addClass("icon-arrows-expand");
                }
                updateSearchQuery(request.data.search, false);
                setSuggestions(request.data.suggestion);
                break;
            /*case 'updateSuggestions':
                //loadWidget();
                setSuggestions(request["suggestions"]);
                break;*/
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

    if (updateData) {
        //chrome.runtime.sendMessage({action: "updateQuery", query: query});
        chrome.runtime.sendMessage({action: "getSuggestions", query: query});
    }
}

function updateEnginesUrls(query) {
    //TODO: replace " " with plus duaaah
    if (query) {
        var splittedQuery = replaceAll(" ", "+", query);
        var google = G_GOOGLE_BASE_URL + splittedQuery;
        var bing = G_BING_BASE_URL + splittedQuery;
        var yahoo = G_YAHOO_BASE_URL + splittedQuery;

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

        li.html('<a href="'+ G_GOOGLE_BASE_URL + replaceAll(" ", "+", suggestions[i]) +  '" target="_top">'
        + suggestions[i]+ "</a>");

        getWidgetContent().find('#suggestions').append(li);
    }

}