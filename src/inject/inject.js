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

    //if it's google
    if(/^https?:\/\/www\.google\.\w{1,3}(\/.*)?/.test(url) && url.indexOf("newtab") == -1) {
        console.log("It's google here!");
        loadWidget();
        chrome.runtime.sendMessage({action: "createEntry"});

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
        $(queryGoogleId).on("change", function() {
            var query = $(queryGoogleId).val();
            updateSearchQuery(query);
        });
    }
    //if it's bing
    else if (/^https?:\/\/www.bing\.\w{1,3}(\/.*)?/.test(url)) {
        console.log("It's bing here!");
        loadWidget();
        chrome.runtime.sendMessage({action: "createEntry"});

        setTimeout(function(){
            var query = $(queryBingId).val();
            updateSearchQuery(query);
        }, 400);

    }
    //if it's yahoo
    else if (/^https?:\/\/search.yahoo.com\/search(.*)/.test(url)) {
        console.log("It's yahoo here!");
        loadWidget();
        chrome.runtime.sendMessage({action: "createEntry"});

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

            case 'tabstate':

                console.log("appending widget");
                loadWidget();

                chrome.runtime.sendMessage({action: 'loadData'});
                break;
            case 'setData':
                console.log("receiving result...: " + JSON.stringify(request));
                if (request.minimized) {
                    $(".widgetClass").css("bottom", "-190px");
                    getWidgetContent().find("#window-action-minimize").removeClass("icon-arrows-compress");
                    getWidgetContent().find("#window-action-minimize").addClass("icon-arrows-expand");
                }
                updateSearchQuery(request.query, false);
                break;
            case 'updateSuggestions':
                setSuggestions(request["suggestions"]);
                break;
            default :
                break;
        }
    });

/**
 * inserts widget in the page
 */
function loadWidget() {
    var widget = $("<div>");
    widget.css({"position": "fixed",
        "overflow": "hidden",
        "margin": "0px",
        "width": "350px",
        "height": "250px",
        "z-index": "1010101",
        "border": "none ! important",
        "bottom": "0px",
        "right": "15px"/*,
         "display": "none"*/});
    widget.addClass(widgetClass);

    //widget.load(chrome.runtime.getURL('src/inject/layout.html'));
    $(document.body).append(widget);


    var $contentFrame = $('<iframe>')
        .addClass(widgetContentClass)
        .attr('style',"top: 0px;\
				right: 0px;\
				width: 100%;\
				height: 100%;\
				margin: 0px ! important;\
				border: none ! important;\
				overflow: hidden  ! important;\
				background-color: transparent  ! important;\
				padding: 0  ! important;");

    $contentFrame.attr('src', 'about:blank');
    $contentFrame.attr("scrolling","no");

    var myContent = '<!DOCTYPE html>'
        + '<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en"><head><title>Health Suggestions iframe</title>'
        + '<link rel="stylesheet" href="'+chrome.extension.getURL('src/inject/css/layout.css')+'"> ' +
        '<link id="font" rel="stylesheet" href="'+chrome.extension.getURL('src/inject/css/font.css')+'" media="screen">'+
        '</head>'
        + '<body></body></html>';

    try {
        //$contentFrame.contents().find('html').html(myContent);
        widget.append($contentFrame);

        var iFrameDoc = $contentFrame[0].contentDocument || $contentFrame[0].contentWindow.document;
        iFrameDoc.write(myContent);
        iFrameDoc.close();

    }
    catch(e)
    {
        console.log('getPreview(): problem with contentframe for widget', $contentFrame);
        return false;
    }


    var $contents = $('<div>');
    $contents.attr("id", "frame");
    $contents.addClass("frame");

    var $header = $("<div>");
    $header.addClass("header");
    $header.html(
        '<div class="header-content">' +
        '<ul class="search-engine">' +
        '<li><a class="search-engine-item" href="#" target="_top"><i id="icon-google" class="icon-google icon-2x"></i></a></li>' +
        '<li><a class="search-engine-item" href="#" target="_top"><i id="icon-bing" class="icon-bing icon-2x"></i></a></li>' +
        '<li><a class="search-engine-item" href="#" target="_top"><i id="icon-yahoo" class="icon-social-yahoo icon-2x"></i></a></li></ul>' +
        '<span class="window-action"><i id="window-action-close" class="icon icon-remove icon-border"></i></span>' +
        '<span class="window-action"><i id="window-action-minimize" class="icon icon-arrows-compress icon-border"></i></span></div>');


    var $body = $("<div>");
    $body.addClass("body");

    $body.html(
        '<div class="body-content">' +
        '<span>Pesquisa original: </span><span id="query" class="blue"></span>' +
        '<ul id="suggestions"></ul>' +
        '</div>');


    $contents.append($header);
    $contents.append($body);


    $contentFrame.contents().find('body').attr('id','myExtension');
    $contentFrame.contents().find('body').append($contents);

    //action onclick
    $(".widgetContentClass").contents().find("#window-action-minimize").on("click", minimize);
}


/**
 * Function that handles user click on minimize/maximize button
 */
function minimize() {
    var i = $(this);
    var isMaximized = i.hasClass("icon-arrows-compress");

    console.log("minimize" + isMaximized);
    $(".widgetClass").animate({
        bottom: isMaximized ? '-190px' : '0px'
    }, 400, function () {
        if(isMaximized) {
            i.removeClass("icon-arrows-compress");
            i.addClass("icon-arrows-expand");
            chrome.runtime.sendMessage({action: "updateMinimized", minimized: true});
        }
        else {
            i.removeClass("icon-arrows-expand");
            i.addClass("icon-arrows-compress");
            chrome.runtime.sendMessage({action: "updateMinimized", minimized: false});
        }
    });


}
/**
 * Updates query text and engine's urls
 * @param query
 */
function updateSearchQuery(query, updateData) {
    updateData = (typeof updateData === "undefined") ? true : updateData;

    //$("#query").text(query);

    getWidgetContent().find('#query').text(query);
    //setSuggestions(["babo", "nabo", "fake"]);
    updateEnginesUrls(query);

    if (updateData) {
        chrome.runtime.sendMessage({action: "updateQuery", query: query});
        chrome.runtime.sendMessage({action: "getSuggestions", query: query});
    }
}

function updateEnginesUrls(query) {
    if (query) {
        var splittedQuery = query.split(" ");
        var google = G_GOOGLE_BASE_URL + splittedQuery[0];
        var bing = G_BING_BASE_URL + splittedQuery[0];
        var yahoo = G_YAHOO_BASE_URL + splittedQuery[0];

        for(var i = 1; i < splittedQuery.length; i++) {
            google += "+" + splittedQuery[i];
            bing += "+" + splittedQuery[i];
            yahoo += "+" + splittedQuery[i];
        }

        var contents = getWidgetContent();

        contents.find("#icon-google").parent().attr("href", google);
        contents.find("#icon-bing").parent().attr("href", bing);
        contents.find("#icon-yahoo").parent().attr("href", yahoo);
    }
}

function setSuggestions(suggestions) {
    for(var i = 0; i < suggestions.length; i++) {
        var li = $("<li>");
        li.addClass("suggestion");
        li.html(suggestions[i]);

        getWidgetContent().find('#suggestions').append(li);
    }

}