/**
 * Created by tiago on 28/02/15.
 */

function getWidget() {
    return $("." + widgetClass);
}

function getWidgetContent() {
    return $("." + widgetContentClass).contents();
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
    $(".widgetContentClass").contents().find("#window-action-minimize").on("click", widgetMinimize);
    $(".widgetContentClass").contents().find("#window-action-close").on("click", widgetClose);
}


/**
 * Function that handles user click on widgetMinimize/maximize button
 */
function widgetMinimize() {
    var i = $(this);
    var isMaximized = i.hasClass("icon-arrows-compress");

    console.log("widgetMinimize" + isMaximized);
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


function widgetClose() {
    $("." + widgetContentClass).remove();
    chrome.runtime.sendMessage({action: "close", close: true});
}