$(document).ready(function() {
    var url = window.location.href;





    if(/^https?:\/\/www\.google\.\w{1,3}(\/.*)?/.test(url) && url.indexOf("newtab") == -1) {
        loadWidget();
        chrome.runtime.sendMessage({action: "createEntry"});
        $("."+widgetClass).css("display", "inline-block");

        setTimeout(function(){
            $("#query").text($("#gbqfq").val());
            chrome.runtime.sendMessage({action: "updateData", data: $("#gbqfq").val()});
        }, 400);

        //recordTabSearch()
        $("#gbqfq").on("change", function() {
            console.info($("#gbqfq").val());
            $("#query").text($("#gbqfq").val());
            chrome.runtime.sendMessage({action: "updateData", data: $("#gbqfq").val()});
        });
    }
    else
        chrome.runtime.sendMessage({action: "ready"});

});

var widgetClass = "widgetClass";


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
    $("#query").text($("#gbqfq").val());
}




/*
 function createStorageEntry() {
 console.log("Creating storage entry...");
 chrome.runtime.sendMessage({action: "createEntry"}, function (response) {
 console.log("response: " + JSON.stringify(response));
 });
 }*/

