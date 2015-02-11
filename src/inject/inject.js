var widgetClass = "widgetClass";
var queryGoogleId = "#gbqfq";
var queryBingId = "#sb_form_q";
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
        $("."+widgetClass).css("display", "inline-block");

        //wait a bit, sometimes the search bar content isn't immediately available
        setTimeout(function(){
            var query = $(queryGoogleId).val();
            $("#query").text(query);
            chrome.runtime.sendMessage({action: "updateData", data: query});
        }, 400);

        //handle search changes
        $(queryGoogleId).on("change", function() {
            var query = $(queryGoogleId).val();
            console.info(query);
            $("#query").text(query);
            chrome.runtime.sendMessage({action: "updateData", data: query});
        });
    }
    else if (/^https?:\/\/www.bing\.\w{1,3}(\/.*)?/.test(url)) {
        console.log("It's bing here!");
        loadWidget();
        chrome.runtime.sendMessage({action: "createEntry"});
        $("."+widgetClass).css("display", "inline-block");

        setTimeout(function(){
            var query = $(queryBingId).val();
            $("#query").text(query);
            chrome.runtime.sendMessage({action: "updateData", data: query});
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
                $("."+widgetClass).css("display", "inline-block");

                chrome.runtime.sendMessage({action: 'loadData'});
                break;
            case 'setData':
                console.log("receiving result...: " + JSON.stringify(request.query));
                $("#query").text(request.query);
            default :
                break;
        }
    });

/**
 * inserts widget hidden in the page
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
        "right": "15px",
        "display": "none"});
    widget.addClass(widgetClass);

    widget.load(chrome.runtime.getURL('src/inject/layout.html'));
    $(document.body).append(widget);
    //$("#query").text($(queryGoogleId).val());
}
