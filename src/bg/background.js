/**
 * Action when extension is installed
 */
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");

        console.log("creating database...");
        DB.createDatabase();
        console.log("done creating database...");

        console.log("populating database...");
        DB.populateDatabase();
    } else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");

        //DB.openDatabase();

        chrome.storage.local.clear();
    }

    //chrome.tabs.create({url: "http://www.bing.pt"});


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

        if (!request.action) {
            console.warn('invalid command: ', request);
            return;
        }

        switch (request.action) {
            case 'getTabId':
                sendResponse({tabId: sender.tab.id});
                break;
            case 'ready':
                var obj = {};
                obj[TAB + sender.tab.id] = null;

                chrome.storage.local.get(obj, function(result) {
                    //Checks if this tab was used to do a search
                    console.log("ready result: " + JSON.stringify(result));
                    var data = result[TAB + sender.tab.id];

                    if (data != null && !data[CLOSED]) {
                        console.log("**loading widget**");
                        loadWidget(sender.tab.id);
                    }
                });
                break;
            case 'updateMinimized':
                console.info("Updating minimized...");

                var obj = {};
                obj[TAB + sender.tab.id] = null;

                chrome.storage.local.get(obj, function(result) {
                    result[TAB + sender.tab.id][MINIMIZED] = request.minimized;
                    chrome.storage.local.set(result);
                });

                break;
            case 'close':
                console.info("Closing entry...");

                var obj = {};
                obj[TAB + sender.tab.id] = null;

                chrome.storage.local.get(obj, function(result) {
                    result[TAB + sender.tab.id][CLOSED] = request.close;
                    chrome.storage.local.set(result);
                });

                break;
            case 'loadData':
                console.info("Loading data...");
                var obj = {};
                obj[TAB + sender.tab.id] = null;

                chrome.storage.local.get(obj, function(result) {
                    console.log("loadData result: " + JSON.stringify(result));
                    var data = result[TAB + sender.tab.id];

                    //IF it's closed don't make the call and widget won't be displayed
                    if (data != null && !data[CLOSED])
                        chrome.tabs.sendMessage(sender.tab.id, {action: "setData", data: data});
                    else
                        console.log("loadData error");
                });
                break;
            case 'getSuggestions':
                console.info("Getting suggestions...");
                console.log('getSuggestions: ' + request.query);
                var language = getLanguage(request.query)
                console.log("Language: " + language);
                var query = split(removeDiacritics(request.query)); //need to remove any accentuation and then split
                var words = processWords(query, language); //remove Stop Words and stem them
                console.log("getSuggestions: words: " + words);

                DB.getStringList(words, language, function (sugg) {
                    //chrome.tabs.sendMessage(sender.tab.id, {action: "updateSuggestions", suggestions: sugg});

                    if (sugg.length == 0) {
                        console.log("No suggestions");
                        chrome.tabs.sendMessage(sender.tab.id, {action: "closeWidget"});
                        return;
                    }
                    var obj0 = {};
                    obj0[TAB + sender.tab.id] = null;

                    chrome.storage.local.get(obj0, function(result) {
                        var tab = TAB + sender.tab.id;

                        if (result[TAB + sender.tab.id] == null) {
                            var obj = {};
                            obj[tab] = {};
                            obj[tab][SEARCH] = request.query;
                            obj[tab][MINIMIZED] = false;
                            obj[tab][CLOSED] = false;
                            obj[tab][SUGGESTION] = sugg;

                            console.log("-->" + JSON.stringify(obj));
                            chrome.storage.local.set(obj);
                            //chrome.tabs.sendMessage(sender.tab.id, {action: "setData", data: obj[tab]});
                        } else {
                            result[tab][SUGGESTION] = sugg;
                            result[tab][SEARCH] = request.query;
                            result[tab][CLOSED] = false;
                            console.log("-->" + JSON.stringify(result));
                            chrome.storage.local.set(result);
                            //chrome.tabs.sendMessage(sender.tab.id, {action: "setData", data: result[tab]});
                        }
                        loadWidget(sender.tab.id);
                    });
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
    /*console.log("------------------");
    console.log("sourceTabId: " + details.sourceTabId);
    console.log("------------------");


    console.log("Created new tab with ID: " + details.tabId);


    console.log("parent: " + details.sourceTabId);
    chrome.tabs.query({active: true}, function (res) {
        console.log("activeTab: " + res[0].id);

    });*/

    var obj = {};
    obj[TAB + details.sourceTabId] = null;

    chrome.storage.local.get(obj, function(result) {
        console.log("previous tab result: " + JSON.stringify(result));

        if(result[TAB + details.sourceTabId] != null) {
            var newO = {};
            newO[TAB + details.tabId] = result[TAB + details.sourceTabId];
            newO[TAB + details.tabId][PARENT] = details.sourceTabId;
            console.log("new tab result: " + JSON.stringify(newO));
            chrome.storage.local.set(newO);
            loadWidget(details.tabId);
        }
    });
});

chrome.tabs.onRemoved.addListener(
    function(tabId) {
        console.log("Removing tabID: " + tabId + "....");
        chrome.storage.local.remove(TAB + tabId);

        chrome.storage.local.get(null, function (items) {
            console.log("items: " + JSON.stringify(items));
        });

        //chrome.storage.local.clear();
    });

function loadWidget(id) {
    //console.log('loadWidget message to ',id, active,on);
    console.log("Sending message...");
    chrome.tabs.sendMessage(id, {
        'action': 'loadWidget'
    });
}
/*
function updateStorageProperties(tabid, properties) {

    var obj0 = {};
    obj0[TAB + tabid] = null;
    
    chrome.storage.local.get(obj0, function(result) {
        var tab = TAB + tabid;

        if (result[tab] != null) {
            var obj = {};
            obj[tab] = {};
            obj[tab][SEARCH] = request.query;
            obj[tab][MINIMIZED] = false;
            obj[tab][CLOSED] = false;
            obj[tab][SUGGESTION] = sugg;

            console.log("-->" + JSON.stringify(obj));
            chrome.storage.local.set(obj);
            //chrome.tabs.sendMessage(tabid, {action: "setData", data: obj[tab]});
        }
    });
}*/


chrome.browserAction.onClicked.addListener(function() {
    //chrome.browserAction.setIcon({path: "../../icons/bing.png"});
    chrome.runtime.openOptionsPage(function(){
        if(chrome.runtime.lastError)
            alert("Something went wrong! :(");
    })
});

