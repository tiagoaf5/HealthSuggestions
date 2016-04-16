
function getWidget() {
    return $("." + widgetContentClass);
}

function getWidgetContent() {
    return $("." + widgetContentClass).contents();
}

function getWidgetPanel() {
    return $("#" + panelId);

}


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
    widget.attr("id", panelId);


    //widget.load(chrome.runtime.getURL('src/inject/layout.html'));
    $(document.body).append(widget);


    var $contentFrame = $('<iframe>')
        .addClass(widgetContentClass)
        .attr('style',"top: 0px;\
				right: 0px;\
				width: 100% ! important;\
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
        '<li><i class="icon-heart icon-2x" style="color:rgb(17, 85, 204);"></i></li>' +
        '<li><a data-search-engine="' + GOOGLE + '" class="search-engine-item" href="#" target="_top"><i id="icon-google" class="icon-google icon-2x"></i></a></li>' +
        '<li><a data-search-engine="' + BING + '" class="search-engine-item" href="#" target="_top"><i id="icon-bing" class="icon-bing icon-2x"></i></a></li>' +
        '<li><a data-search-engine="' + YAHOO + '" class="search-engine-item" href="#" target="_top"><i id="icon-yahoo" class="icon-social-yahoo icon-2x"></i></a></li></ul>' +
        '<span class="window-action"><i id="window-action-close" class="icon icon-remove"></i></span>' +
        '<span class="window-action"><i id="window-action-minimize" class="icon icon-arrows-compress"></i></span></div>');


    var $body = $("<div>");
    $body.addClass("body");

    $body.html(
        '<div class="body-content">' +
        '<b id="query"></b>' +
        '<ul id="suggestions"></ul>' +
        '</div>');


    $contents.append($header);
    $contents.append($body);


    $contentFrame.contents().find('body').attr('id','myExtension');
    $contentFrame.contents().find('body').append($contents);

    var addedWidget = getWidget();
    var addedPanel = getWidgetPanel();
    //actions onclick
    addedWidget.contents().find("#window-action-minimize").on("click", widgetMinimize);
    addedWidget.contents().find("#window-action-close").on("click", widgetClose);
    addedWidget.contents().on("click", "#suggestions > li > a", function(e) {
        TrackingSystem.logPanelSuggestions($(this), e.which);
    });
    addedWidget.contents().on("click", "ul.search-engine > li > a.search-engine-item", function() {
        TrackingSystem.logPanelSwitchSearchEngine($(this), searchEngineBeingUsed);
    });
    addedPanel.on("mouseenter", function () {
        TrackingSystem.logTimeOnSuggestionBoard(true);
    });
    addedPanel.on("mouseleave", function () {
        TrackingSystem.logTimeOnSuggestionBoard(false);
    });

}


/**
 * Function that handles user click on widgetMinimize/maximize button
 */
function widgetMinimize() {
    var i = $(this);
    var isMaximized = i.hasClass("icon-arrows-compress");

    console.log("widgetMinimize" + isMaximized);
    $("." + widgetClass).animate({
        bottom: isMaximized ? WINDOW_MINIMIZE_OFFSET : '0px'
    }, 400, function () {
        if(isMaximized) {
            i.removeClass("icon-arrows-compress");
            i.addClass("icon-arrows-expand");
            chrome.runtime.sendMessage({action: "updateMinimized", minimized: true});
            TrackingSystem.logSuggestionBoard('minimize');
        }
        else {
            i.removeClass("icon-arrows-expand");
            i.addClass("icon-arrows-compress");
            chrome.runtime.sendMessage({action: "updateMinimized", minimized: false});
            TrackingSystem.logSuggestionBoard('maximize');

        }
    });
}


function widgetClose(updateData) {
    updateData = (typeof updateData === "undefined") ? true : updateData;

    $("." + widgetContentClass).remove();

    if(updateData) {
        chrome.runtime.sendMessage({action: "close", close: true});
        TrackingSystem.logSuggestionBoard('close');
    }
}

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function computePageLoadTime(date) {
    var now = date.getTime();
    pageLoadTime = now - performance.timing.navigationStart;
    //console.log("User-perceived page loading time: " + pageLoadTime + "ms");
    TrackingSystem.logPageLoadTime(date, pageLoadTime);
}

function getCurrentSearchPage(engine) {
    var index = 1;

    switch(engine) {
        case GOOGLE:
            index = Number($("div#navcnt tr > td.cur").text());
            break;
        case BING:
            $("li.b_pag ul").children("li").each(function(i) {
                if($(this).children(":first").attr('href') === undefined)
                    index = $(this).children(":first").text(); //when page 1 there isn't the back row so we need to add 1
            });
            break;
        case YAHOO:
            $("ol.searchBottom div.compPagination").children().each(function(i) {
                if($(this).prop('tagName') === "STRONG")
                    index = $(this).text(); //when page 1 there isn't the back row so we need to add 1
            });
            break;
        default:
            index = -1;
            break;
    }

    console.log("getCurrentSearchPage: " + index);
    return index;
}