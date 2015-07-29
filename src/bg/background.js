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

        chrome.storage.local.clear();
    }
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
                            removeTabFromHash(sender.tab.id);
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
                            logObj[hash] = {};
                            logObj[hash][TABS_SEARCH] = [sender.tab.id];

                            //Search Table
                            //[hash][table][key]
                            logObj[hash]['Search'] = {};
                            logObj[hash]['Search']['query'] = request.query;
                            logObj[hash]['Search']['Suggestions'] = sugg;
                            logObj[hash]['Search']['queryInputTimestamp'] = nowMilliseconds.toJSON();
                            logObj[hash]['Search']['totalNoResults'] = "";
                            logObj[hash]['Search']['answerTime'] = "";
                            logObj[hash]['Events'] = [];
                            logObj[hash]['WebPages'] = [];

                            console.log("-log->" + JSON.stringify(logObj));
                            chrome.storage.local.set(logObj);
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

                saveLogData(sender.tab.id, request.logTable, request.global, request.data);

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
            //newO[TAB + details.tabId][PARENT] = details.sourceTabId;

            // if logging -> add the tab to the list of tabs in logging object
            if(SETTINGS.get('logging') === true) {
                var logObj = {};
                var hash = result[TAB + details.sourceTabId][HASH];
                logObj[hash] = null;

                chrome.storage.local.get(logObj, function(logResult) {
                    logResult[hash][TABS_SEARCH] = logResult[hash][TABS_SEARCH].concat(details.tabId);
                    chrome.storage.local.set(logResult);
                    //console.log("hash_after_new_window: " + JSON.stringify(logResult));
                });
            }
            console.log("new tab result: " + JSON.stringify(newO));
            chrome.storage.local.set(newO);
            loadWidget(details.tabId);
        }
    });
});

function saveLogData(tabId, logTable, global, data) {
    console.log("table: " + logTable + ", data: " + JSON.stringify(data));

    getLogSavedData(tabId, function(object, hash) {
        if (object === ERROR) return;
        var object2 = object[hash];

        var toSave = true;

        switch (logTable)  {
            case 'Session':
                if(!object2[logTable])
                    object2[logTable] = {};

                object2[logTable] = data;
                chrome.storage.local.set(object);

                break;
            case TABLE_SEARCH_PAGE:
                if(data['SERPOrder'] == 1) {
                    object2['Search']['totalNoResults'] = data['SearchResults']['totalNoResults'];
                    object2['Search']['answerTime'] = data['SearchResults']['answerTime'] ? data['SearchResults']['answerTime'] : "";
                    object2['Search']['SearchPages'] = [{SERPOrder: data['SERPOrder'],
                        totalTimeOverSearchPage: data['totalTimeOverSearchPage'],
                        totalTimeOverSuggestionBoard: data['totalTimeOverSuggestionBoard'],
                        timestamp: data['timestamp'],
                        url: data['url'],
                        SearchResults: data['SearchResults']['results']
                    }];
                    object2['Search']['SearchEngine'] = data['SearchEngine'];
                    object2['Search']['SERelatedSearches'] = data['SearchResults']['SERelatedSearches'];

                }
                break;
            case TABLE_EVENT:
                var timestamp = new Date().toJSON();
                switch (data.EventType) {
                    case 'copy':
                        object2['Events'].push({EventType: 'copy', EventTimestamp: timestamp, copyText: data.copyText, url: global.page_url});
                        break;
                    case 'find':
                    case 'ShowSugBoard':
                    case 'HideSugBoard':
                    case 'CloseSugBoard':
                        object2['Events'].push({EventType: data.EventType, EventTimestamp: timestamp, url: global.page_url});
                        break;
                    case 'SwitchSE':
                        object2['Events'].push({EventType: 'SwitchSE', EventTimestamp: timestamp,
                            from: data.from, to: data.to, url: global.page_url});
                        break;
                    case 'ClickSuggestion':
                    case 'ClickSERelatedSearch':
                        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^");
                        object2['Events'].push({EventType: data.EventType, EventTimestamp: timestamp,
                            linkText: data.linkText, button: data.button, suggestion: data.suggestion, url: global.page_url});
                        break;
                    case 'ClickSearchResult':
                        object2['Events'].push({EventType: data.EventType, EventTimestamp: timestamp,
                            linkText: data.linkText, button: data.button, title: data.title, link: data.link, url: global.page_url});
                        break;
                    //ShowSugBoard etc
                }

                break;
            default:
                toSave = false;
        }

        console.log('-object->' + JSON.stringify(object));

        if (toSave)
            chrome.storage.local.set(object);

    });
};

function getHash(tabId, callback) {
    var obj0 = {};
    obj0[TAB + tabId] = null;

    chrome.storage.local.get(obj0, function(result) {
        var hash = result[TAB + tabId][HASH];
        if(hash)
            callback(hash);
        else
            callback(ERROR);
    });

}

function getLogSavedData(tabId, callback) {
    getHash(tabId, function(hash) {
        if (hash !== ERROR) {

            var obj0 = {};
            obj0[hash] = null;

            chrome.storage.local.get(obj0, function(result){
                if (result)
                    callback(result, hash);
                else
                    callback(ERROR);
            });
        }
    });
}

//Removes tab from hash and if list of tabs is empty send data to server
function removeTabFromHash(tabId) {
    getLogSavedData(tabId, function (result, hash) {
        var index = result[hash][TABS_SEARCH].indexOf(tabId);

        if (index !== -1) {
            result[hash][TABS_SEARCH].splice(index, 1);
        }

        console.log("hash_after_remove_window: " + JSON.stringify(result));

        if (result[hash][TABS_SEARCH].length === 0) {
            //TODO: Send data to server
            console.log("Sending data to server : " + JSON.stringify(result[hash]));
            chrome.storage.local.remove(hash);
        } else {
            chrome.storage.local.set(result);
        }
    });
}

chrome.tabs.onRemoved.addListener( function(tabId) {
    console.log("Removing tabID: " + tabId + "....");

    removeTabFromHash(tabId);

    /*var obj = {};
    obj[TAB + tabId] = null;

    //Check logging
    chrome.storage.local.get(obj, function(result) {
        if(result[TAB + tabId] != null) {
            var hash = result[TAB + tabId][HASH];

            var logObj = {};
            logObj[hash] = null;

            chrome.storage.local.get(logObj, function(logResult) {
                var index = logResult[hash][TABS_SEARCH].indexOf(tabId);

                if(index !== -1) {
                    logResult[hash][TABS_SEARCH].splice(index, 1);
                }

                console.log("hash_after_remove_window: " + JSON.stringify(logResult));

                if(logResult[hash][TABS_SEARCH].length === 0) {
                    //TODO: Send data to server
                    console.log("Sending data to server : " + JSON.stringify(logResult[hash]));
                    chrome.storage.local.remove(hash);
                } else {
                    chrome.storage.local.set(logResult);
                }
            });
        }
    });*/

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
        'action': 'loadWidget', logging: SETTINGS.get('logging'), enabled: SETTINGS.get('enabled')
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
    chrome.runtime.openOptionsPage(function(){
        if(chrome.runtime.lastError)
            alert("Something went wrong! :(");
    })
});

