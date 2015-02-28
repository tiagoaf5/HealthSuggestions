/**
 * Created by tiago on 28/02/15.
 */
/*
function minimize() {
    var i = $(this);
    var isMaximized = i.hasClass("icon-arrows-compress");

    console.log("minimize" + isMaximized);
    $(".widgetClass").animate({
        bottom: isMaximized ? '-200px' : '0px'
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

}*/