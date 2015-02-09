chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            console.log("Hello. This message was sent from scripts/inject.js");
            // ----------------------------------------------------------


            /*var iframe = document.createElement('div');
             // Must be declared at web_accessible_resources in manifest.json
             iframe.id = "myiframe";
             iframe.src = chrome.runtime.getURL('src/inject/layout.html');
             iframe.scrolling = "no";
             iframe.style.cssText = "position: fixed !important; \
             overflow: hidden;\
             margin: 0px;\
             width: 350px; \
             height: 250px;\
             z-index: 1010101;\
             border: none ! important;\
             bottom: 0px;\
             right: 15px;";*/
            var url = window.location.href;

            if(/^https?:\/\/www\.google\.\w{1,3}(\/.*)?/.test(url)) {
                loadWidget();
                $("#gbqfq").on("change", function() {
                    console.info($("#gbqfq").val());
                    $("#query").text($("#gbqfq").val());

                });
            }










            //Works
            /*
             var div = document.createElement('div');
             var google = chrome.runtime.getURL('icons/google.ico');
             var bing = chrome.runtime.getURL('icons/bing.png');
             var yahoo = chrome.runtime.getURL('icons/yahoo.png');
             div.style.cssText = 'z-index: 1010101;position: fixed;' +
             'bottom: 0px;right: 50px;';
             div.innerHTML = '<div id="frame"><div class="header"><div class="header-content"><ul class="search-engine"><li><a href="#"><img src="' +
             google + '"></a></li><li><a href="#"><img src="' +
             bing + '"></a></li><li><a href="#"><img src="' +
             yahoo + '"></a></li></ul><span class="minimize"><a href="#">x</a></span><span class="minimize"><a href="#">_</a></span></div></div><div class="body"><div class="body-content"><span>Pesquisa original: </span><span id="query" class="blue">nabo</span></div></div></div>';
             document.body.appendChild(div);
             */

            //var content = '<div style=""><iframe src="chrome-extension://__MSG_@@extension_id__/src/inject/layout.html"></iframe></div>';
            //document.body.innerHTML += content;
        }

    }, 10);
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
        "right": "15px"});

    widget.load(chrome.runtime.getURL('src/inject/layout.html'));
    $("body").append(widget);
    $("#query").text($("#gbqfq").val());
}