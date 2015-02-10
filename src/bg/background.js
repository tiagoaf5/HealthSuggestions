// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

/*var settings = new Store("settings", {
 "sample_setting": "This is how you use Store.js to remember values"
 });
 */

var SEARCH = "search";

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
            "from the extension");
        console.log("request: " + JSON.stringify(request));

        if (request.greeting == "hello") {
            sendResponse({farewell: "goodbye"});
        }

        if (!request.action) {
            console.warn('invalid command: ', request);
            return;
        }

        switch (request.action) {
            case 'getTabId':
                sendResponse({tabId: sender.tab.id});
                break;
            case 'createEntry':
                /* if(chrome.storage.local.get(SEARCH + sender.tab.id) == chrome.runtime.lastError)
                 sendResponse();

                 chrome.storage.local.set({'value': theValue}*/
                console.info("Creating entry...");
                var obj = {};
                obj[SEARCH + sender.tab.id] = null;
                chrome.storage.local.set(obj);
                break;
            case 'ready':
                var obj = {};
                obj[SEARCH + sender.tab.id] = null;

                chrome.storage.local.get(obj, function(result) {
                    //Checks if this tab was used to do a search
                    console.log("ready result: " + JSON.stringify(result));
                    if (result[SEARCH + sender.tab.id])
                        notifyTabOfState(sender.tab.id);

                });
                break;
            case 'updateData':
                console.info("Creating entry...");
                var obj = {};
                obj[SEARCH + sender.tab.id] = request.data;
                chrome.storage.local.set(obj);
                break;
            case 'loadData':
                var obj = {};
                obj[SEARCH + sender.tab.id] = null;

                chrome.storage.local.get(obj, function(result) {
                    //Checks if this tab was used to do a search
                    console.log("loadData result: " + JSON.stringify(result));
                    if (result[SEARCH+sender.tab.id])
                        chrome.tabs.sendMessage(sender.tab.id, {action: "setData", query: result[SEARCH+sender.tab.id]});
                    else
                        console.log("loadData error");

                });
                break;

            default:
                console.warn('Unknown request: ', request);

        }
    });

/**
 * used instead of chrome.tabs.onCreated.addListener(function(details)
 * because this one isn't triggered when a user opens a new empty tab
 * just when a tab is opened from a link in another tab
 */
chrome.webNavigation.onCreatedNavigationTarget.addListener(function (details) {
    console.log("------------------");
    console.log("sourceTabId: " + details.sourceTabId);
    console.log("------------------");


    console.log("Created new tab with ID: " + details.tabId);


    console.log("parent: " + details.sourceTabId);
    chrome.tabs.query({active: true}, function (res) {
        console.log("activeTab: " + res[0].id);

    });
    var obj = {};
    obj[SEARCH + details.sourceTabId] = null;

    chrome.storage.local.get(obj, function(res) {
        console.log("onCreated: " + JSON.stringify(res));
        if(res[SEARCH + details.sourceTabId] != null) {
            var newO = {};
            newO[SEARCH + details.tabId] = res[SEARCH + details.sourceTabId];
            chrome.storage.local.set(newO);

            notifyTabOfState(details.tabId);
        }
    });

});

chrome.tabs.onRemoved.addListener(
    function(tabId) {
        chrome.storage.local.remove(SEARCH + tabId);


    });

function notifyTabOfState(id) {
    //console.log('notifyTabOfState message to ',id, active,on);
    console.log("Sending message...");
    chrome.tabs.sendMessage(id, {
        'action': 'tabstate'
    });
}
/*

 //example of using a message handler from the inject scripts
 chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {

 console.log("benfica");
 sendResponse({farewell: "goodbye"});
 if(!request.action)
 {
 console.warn('invalid command: ',request);
 return;
 }

 console.log('new message: '+request.action, request);

 switch (request.action) {
 case 'getTabId':
 sendResponse(sender.tab.id);
 break;
 default:
 console.warn('Unknown request: ',request);
 }

 //chrome.pageAction.show(sender.tab.id);
 //sendResponse();
 });*/
/*
 chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
 console.log(sender.tab ?
 "from a content script:" + sender.tab.url :
 "from the extension");
 if (request.greeting == "hello")
 sendResponse({farewell: "goodbye"});
 });*/