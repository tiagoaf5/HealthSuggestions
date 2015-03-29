// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

/*var settings = new Store("settings", {
 "sample_setting": "This is how you use Store.js to remember values"
 });
 */

var SEARCH = "search";
var MINIMIZED = "minimized";
var SUGGESTION = "suggestion"
//var db;

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");

        console.log("creating database...");
        DB.createDatabase();
        console.log("done creating database...");

        console.log("populating database...");
        DB.populateDatabase();
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");

        DB.openDatabase();
    }
    chrome.tabs.create({url: "http://www.bing.pt"});


});


/**
 * handles incoming messages from content script
 */
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
                obj[MINIMIZED + sender.tab.id] = false;
                chrome.storage.local.set(obj);
                break;
            case 'ready':


                //TEST to check what is saved in storage
                /*chrome.storage.local.get(null, function(items) {

                 console.log("items: " + JSON.stringify(items));
                 });*/

                var obj = {};
                obj[SEARCH + sender.tab.id] = null;

                chrome.storage.local.get(obj, function(result) {
                    //Checks if this tab was used to do a search
                    console.log("ready result: " + JSON.stringify(result));
                    if (result[SEARCH + sender.tab.id])
                        loadWidget(sender.tab.id);

                });

                //DB.executeSql("SELECT COUNT(*) FROM CHVConcept",[]);


                break;
            case 'updateQuery':
                console.info("Updating entry...");
                var obj = {};
                obj[SEARCH + sender.tab.id] = request.query;
                chrome.storage.local.set(obj);
                break;
            case 'updateMinimized':
                console.info("Creating entry...");
                var obj = {};
                obj[MINIMIZED + sender.tab.id] = request.minimized;
                chrome.storage.local.set(obj);
                break;
            case 'loadData':
                var obj = {};
                obj[SEARCH + sender.tab.id] = null;
                obj[MINIMIZED + sender.tab.id] = null;
                obj[SUGGESTION + sender.tab.id] = null;

                chrome.storage.local.get(obj, function(result) {
                    //Checks if this tab was used to do a search
                    console.log("loadData result: " + JSON.stringify(result));
                    if (result[SEARCH+sender.tab.id])
                        chrome.tabs.sendMessage(sender.tab.id, {action: "setData", query: result[SEARCH+sender.tab.id],
                            minimized: result[MINIMIZED + sender.tab.id] ? true : false,
                            suggestions: result[SUGGESTION + sender.tab.id]});
                    else
                        console.log("loadData error");

                });
                break;
            case 'getSuggestions':

                var info = 'getSuggestions: ';
                console.log(info + request.query);
                var query = removeDiacritics(request.query); //need to remove any accentuation
                var words = query.split(" ");

                DB.getStringList(words, function (sugg) {
                    chrome.tabs.sendMessage(sender.tab.id, {action: "updateSuggestions", suggestions: sugg});
                    var obj = {};
                    obj[SUGGESTION + sender.tab.id] = sugg;
                    chrome.storage.local.set(obj);
                });


                //DB.executeSql("SELECT * FROM CHVIndexPT WHERE term = ?", [words[i]]);

                //console.log("OBJECT: " + JSON.stringify(object));


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

            loadWidget(details.tabId);
        }
    });

});

chrome.tabs.onRemoved.addListener(
    function(tabId) {
        console.log("Removing tabID: " + tabId + "....");
        chrome.storage.local.remove(SEARCH + tabId);
        chrome.storage.local.remove(MINIMIZED + tabId);
        //chrome.storage.local.clear();
    });

chrome.app.window.onClosed.addListener(function () {
    console.log("closed window");
});


function loadWidget(id) {
    //console.log('loadWidget message to ',id, active,on);
    console.log("Sending message...");
    chrome.tabs.sendMessage(id, {
        'action': 'loadWidget'
    });
}
