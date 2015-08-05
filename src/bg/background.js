/**
 * Action when extension is installed
 */
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
        /*console.log("creating database...");
         DB.createDatabase();
         console.log("done creating database...");

         console.log("populating database...");
         DB.populateDatabase();*/
    } else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");

        //DB.openDatabase();
        logDB.deleteDatabase();
        logDB.open(function () {
            console.info("logDB opened");
        });
        chrome.storage.local.clear();
    }
});


/**
 * handles incoming messages from content script
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        console.log("s-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#");
        console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
            "from the extension");

        console.dir(request);

        console.log("e-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#");


        if (!request.action) {
            console.warn('invalid command: ', request);
            return;
        } else if (SETTINGS.get('enabled') === false) {
            console.info('Extension disabled');
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

                var obj0 = {};
                obj0[TAB + sender.tab.id] = null;
                chrome.storage.local.get(obj0, function(result) {
                    var tab = TAB + sender.tab.id;

                    if (result[TAB + sender.tab.id] != null && result[tab][SEARCH] === request.query &&
                        result[tab][SEARCH_ENGINE] === request.search_engine)
                    {
                        console.info("Providing suggestions... (same search)");
                        loadWidget(sender.tab.id);
                        return;
                    }

                    console.info("Getting suggestions...");
                    console.log('getSuggestions: ' + request.query);

                    var language = getLanguage(request.query)
                    var query = split(removeDiacritics(request.query)); //need to remove any accentuation and then split
                    var words = processWords(query, language); //remove Stop Words and stem them

                    DB.getStringList(words, language, function (sugg) {
                        //chrome.tabs.sendMessage(sender.tab.id, {action: "updateSuggestions", suggestions: sugg});

                        if (sugg.length == 0) {
                            console.log("No suggestions");
                            chrome.tabs.sendMessage(sender.tab.id, {action: "closeWidget"});
                            return;
                        }

                        // if a different search but there is data saved in this tab
                        // remove tab from hash and deal with it
                        if (result[TAB + sender.tab.id] != null) {
                            removeTabFromHash(sender.tab.id, function () {});
                        }
                        //if (result[TAB + sender.tab.id] == null) {

                        //create tab object
                        var obj = {};
                        obj[tab] = {};
                        obj[tab][SEARCH] = request.query;
                        obj[tab][MINIMIZED] = false;
                        obj[tab][CLOSED] = false;
                        obj[tab][SUGGESTION] = sugg;
                        obj[tab][SEARCH_ENGINE] = request.search_engine;
                        var nowMilliseconds = new Date();
                        var hash = CryptoJS.SHA1(request.query + nowMilliseconds.toUTCString());
                        hash = hash.toString();
                        obj[tab][HASH] = hash;

                        console.log("-tab->" + JSON.stringify(obj));
                        chrome.storage.local.set(obj);

                        //create object to hold search's logging
                        if (SETTINGS.get('logging') === true) {
                            var logObj = {};
                            logObj[TABS_SEARCH] = [sender.tab.id];

                            //Search Table
                            logObj['hash'] = hash;
                            logObj['Search'] = {};
                            logObj['Search']['query'] = request.query;
                            logObj['Search']['Suggestions'] = sugg;
                            logObj['Search']['queryInputTimestamp'] = nowMilliseconds.toJSON();
                            logObj['Search']['totalNoResults'] = "";
                            logObj['Search']['answerTime'] = "";
                            logObj['Search']['SearchPages'] = [];

                            logObj['Events'] = [];
                            logObj['WebPages'] = [];
                            logDB.createEntry(hash, logObj);
                            console.log("-log->" + JSON.stringify(logObj));
                        }

                        /*} else {
                         result[tab][SEARCH_ENGINE] = request.search_engine;
                         result[tab][SUGGESTION] = sugg;
                         result[tab][SEARCH] = request.query;
                         result[tab][CLOSED] = false;
                         console.log("-->" + JSON.stringify(result));
                         chrome.storage.local.set(result);
                         //chrome.tabs.sendMessage(sender.tab.id, {action: "setData", data: result[tab]});
                         }*/
                        loadWidget(sender.tab.id);
                    });
                });





                break;
            case LOG:
                getHash(sender.tab.id, function(hash){
                    if (hash !== ERROR) {
                        logDB.saveLogData(hash,request.logTable, request.global, request.data);
                    }
                });
                //saveLogData(sender.tab.id, request.logTable, request.global, request.data);
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
    var obj = {};
    obj[TAB + details.sourceTabId] = null;

    chrome.storage.local.get(obj, function(result) {
        console.log("previous tab result: " + JSON.stringify(result));

        if(result[TAB + details.sourceTabId] != null) {
            var newO = {};
            newO[TAB + details.tabId] = result[TAB + details.sourceTabId];

            // if logging -> add the tab to the list of tabs in logging object
            if(SETTINGS.get('logging') === true) {
                logDB.editTabs(result[TAB + details.sourceTabId][HASH], details.tabId, true, function() {
                    console.log("Added tab to logDB");
                });
            }
            console.log("new tab result: " + JSON.stringify(newO));
            chrome.storage.local.set(newO);
            loadWidget(details.tabId);
        }
    });
});


function getHash(tabId, callback) {
    var obj0 = {};
    obj0[TAB + tabId] = null;

    chrome.storage.local.get(obj0, function(result) {
        if( result[TAB + tabId] === null){
            callback(ERROR);
            return;
        }

        var hash = result[TAB + tabId][HASH];
        if(hash)
            callback(hash);
        else
            callback(ERROR);
    });

}


//Removes tab from hash and if list of tabs is empty send data to server
function removeTabFromHash(tabId, callback) {

    getHash(tabId, function (e) {
        if (e != ERROR) {
            logDB.editTabs(e, tabId, false, function (result) {

                console.log("removed tab from loggingDB");

                //TODO: trigger close tab event
                /*chrome.tabs.get(tabId, function(tab) {

                 saveLogData(tabId, TABLE_EVENT,{page_url: tab.url}, {EventType: 'RmTab'});
                 });*/

                if (result[TABS_SEARCH].length === 0) {
                    //TODO: Send data to server
                    console.info("Sending data to server : " + JSON.stringify(result));
                    logDB.removeEntry(result.hash, function () {
                        callback();
                    }); //after sending to server, remove from database
                }
                else callback();
            });
        }
    });
}

chrome.tabs.onRemoved.addListener( function(tabId) {
    console.log("Removing tabID: " + tabId + "....");

    removeTabFromHash(tabId, function() {
        chrome.storage.local.remove(TAB + tabId);

        chrome.storage.local.get(null, function (items) {
            console.log("items: " + JSON.stringify(items));
        });
        //chrome.storage.local.clear();
    });
});

function loadWidget(id) {
    //console.log('loadWidget message to ',id, active,on);
    console.log("Sending message...");
    chrome.tabs.sendMessage(id, {
        'action': 'loadWidget', logging: SETTINGS.get('logging'), enabled: SETTINGS.get('enabled')
    });
}


chrome.browserAction.onClicked.addListener(function() {
    chrome.runtime.openOptionsPage(function(){
        if(chrome.runtime.lastError)
            alert("Something went wrong! :(");
    })
});
