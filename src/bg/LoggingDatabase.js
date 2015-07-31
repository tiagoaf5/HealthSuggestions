var logDB = (function () {
    var tDB = {};
    var datastore = null;
    var version = 1;         // Database version.

    var addWebpage = function(result, global, data) {
        console.log("------------------------------------");
        console.log("Adding webpage");
        console.log(JSON.stringify(global));
        console.log(JSON.stringify(data));
        var webpages = result['WebPages'];

        var alreadyExists = false;
        var alreadyExistsWebpage;
        var referrerWebPage;
        for (var i = 0; i < webpages.length; i++) {
            if (webpages[i].url === global.page_url) {
                alreadyExists = true;
                alreadyExistsWebpage = webpages[i];
                break;
            } else if (webpages[i].url === global.referrer_url) {
                referrerWebPage = webpages[i];
            }
        }

        //don't want to add pages if user moves to a new page by changing the address bar url
        if (global.referrerUrl === "")
            alreadyExists = true;

        if (!alreadyExists) {
            console.log("doesn't exist");
            var searchResult;
            var pageLoadTimestamp = data.pageLoadTimestamp ? data.pageLoadTimestamp : "";
            var url;
            var referrerURL;

            //if it comes from a SERPSuggestionClick it brings the searchResult
            if (data.link) {
                searchResult = {link: data.link};
                url = data.link;
                referrerURL = global.page_url;
            } else { //Otherwise we must look for parent's searchResult
                url = global.page_url;
                referrerURL = global.referrer_url;
                if (referrerWebPage.searchResult) {
                    searchResult = {link: referrerWebPage.searchResult.link};
                }
            }

            var newObject = {
                url: url, referrerUrl: referrerURL,
                searchResult: searchResult, pageLoadTimestamp: pageLoadTimestamp,
                timeOnPage: 0, numScrollEvents: 0
            };

            console.log(newObject);
            webpages.push(newObject);
        }
        else { //check if already has pageLoadTimestamp
            if(alreadyExistsWebpage.pageLoadTimestamp === "") {
                if(data.pageLoadTimestamp)
                    alreadyExistsWebpage.pageLoadTimestamp = data.pageLoadTimestamp;
                else
                    return false;
            }
        }
        console.log("------------------------------------");
        return true;
    };


    /**
     * Open a connection to the datastore.
     */
    tDB.open = function(callback) {

        // Open a connection to the datastore.
        var request = indexedDB.open(LOG_DB, version);

        // Handle datastore upgrades.
        request.onupgradeneeded = function(e) {
            var db = e.target.result;

            e.target.transaction.onerror = tDB.onerror;

            // Delete the old datastore.
            if (db.objectStoreNames.contains(LOG_DB)) {
                db.deleteObjectStore(LOG_DB);
            }

            // Create a new datastore.
            var store = db.createObjectStore(LOG_DB, {
                keyPath: 'hash' //you have specified that the key to your items should be stored under will be a property called hash
            });
        };

        // Handle successful datastore access.
        request.onsuccess = function(e) {
            // Get a reference to the DB.
            datastore = e.target.result;

            // Execute the callback.
            callback();
        };

        // Handle errors when opening the datastore.
        request.onerror = tDB.onerror;
    };

    tDB.deleteDatabase = function() {
        var req = indexedDB.deleteDatabase(LOG_DB);
        req.onsuccess = function () {
            console.log("Deleted database successfully");
        };
        req.onerror = function () {
            console.log("Couldn't delete database");
        };
        req.onblocked = function () {
            console.log("Couldn't delete database due to the operation being blocked");
        };
    };

    /*    tDB.addEvent = function(hash, event, callback) {

     };*/

    tDB.createEntry = function (hash, data) {
        var transaction = datastore.transaction([LOG_DB], "readwrite");
        var store = transaction.objectStore(LOG_DB);


        var request = store.add(data);

        request.onerror = function(e) {
            console.log("Error", e.target.error.name);
            //some type of error handler
        }

        request.onsuccess = function(e) {
            console.log("Woot! Did it");
        }

    };

    tDB.removeEntry = function(hash, callback) {
        console.log("tDB.removeEntry: " + hash);
        var transaction = datastore.transaction([LOG_DB], "readwrite");
        var store = transaction.objectStore(LOG_DB);

        var request = store.delete(hash);

        request.onerror = function(e) {
            console.log("Error", e.target.error.name);
            //some type of error handler
        }

        request.onsuccess = function(e) {
            console.log("Woot! Did it");
            callback();
        }
    };

    tDB.editTabs = function(hash, tabid, add, callback) {
        var transaction = datastore.transaction([LOG_DB], "readwrite");
        var objectStore = transaction.objectStore(LOG_DB);

        //x is some value
        var ob = objectStore.get(hash);

        ob.onsuccess = function(e) {
            var result = e.target.result;

            var index = result[TABS_SEARCH].indexOf(tabid);

            if(add) {
                if (index === -1) {
                    result[TABS_SEARCH] = result[TABS_SEARCH].concat(tabid);
                }
            } else { // delete tabid
                if (index !== -1) {
                    result[TABS_SEARCH].splice(index, 1);
                }
            }

            var update = objectStore.put(result);

            update.onsuccess = function (ev) {
                var todoName = ev.target.result;
                console.log('Successfully edited key ' + todoName);
                callback(result);
            };

            update.onerror = function (ev) {
                console.log('Error occured', ev.srcElement.error.message);
            };
        };


    };

    tDB.saveLogData =  function (hash, logTable, global, data) {
        console.log("tDB.saveLogData-> table: " + logTable +", global: " + JSON.stringify(global) +  ", data: " + JSON.stringify(data));


        var transaction = datastore.transaction([LOG_DB], "readwrite");
        var objectStore = transaction.objectStore(LOG_DB);

        //x is some value
        var ob = objectStore.get(hash);

        ob.onsuccess = function(e) {
            var result = e.target.result;
            //console.log("Result::");
            //console.dir(result);


            var toSave = true;

            switch (logTable)  {
                case 'Session':
                    if(!result[logTable])
                        result[logTable] = {};

                    result[logTable] = data;
                    break;
                case TABLE_SEARCH_PAGE:
                    if(data['SERPOrder'] == 1) {
                        result['Search']['totalNoResults'] = data['SearchResults']['totalNoResults'];
                        result['Search']['answerTime'] = data['SearchResults']['answerTime'] ? data['SearchResults']['answerTime'] : "";
                        result['Search']['SearchPages'] = [{SERPOrder: data['SERPOrder'],
                            totalTimeOverSearchPage: data['totalTimeOverSearchPage'],
                            totalTimeOverSuggestionBoard: data['totalTimeOverSuggestionBoard'],
                            timestamp: data['timestamp'],
                            url: data['url'],
                            SearchResults: data['SearchResults']['results']
                        }];
                        result['Search']['SearchEngine'] = data['SearchEngine'];
                        result['Search']['SERelatedSearches'] = data['SearchResults']['SERelatedSearches'];

                    }
                    break;
                case TABLE_EVENT:
                    var timestamp = new Date().toJSON();
                    switch (data.EventType) {
                        case 'copy':
                            result['Events'].push({EventType: 'copy', EventTimestamp: timestamp, copyText: data.copyText, url: global.page_url});
                            break;
                        case 'find':
                        case 'ShowSugBoard':
                        case 'HideSugBoard':
                        case 'CloseSugBoard':
                            result['Events'].push({EventType: data.EventType, EventTimestamp: timestamp, url: global.page_url});
                            break;
                        case 'SwitchSE':
                            result['Events'].push({EventType: 'SwitchSE', EventTimestamp: timestamp,
                                from: data.from, to: data.to, url: global.page_url});
                            break;
                        case 'ClickSuggestion':
                        case 'ClickSERelatedSearch':
                            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^");
                            result['Events'].push({EventType: data.EventType, EventTimestamp: timestamp,
                                linkText: data.linkText, button: data.button, suggestion: data.suggestion, url: global.page_url});
                            break;
                        case 'ClickSearchResult':
                            result['Events'].push({EventType: data.EventType, EventTimestamp: timestamp,
                                linkText: data.linkText, button: data.button, title: data.title, link: data.link, url: global.page_url});

                            addWebpage(result, global, data);
                            break;
                        case 'cenas': //receber dados das webpages
                            break;

                        default :
                            toSave = false;
                            break;
                        //ShowSugBoard etc
                    }

                    break;
                case TABLE_WEBPAGE:
                    switch (data.type) {
                        case 'logPageLoadTime':
                            toSave = addWebpage(result, global, data);
                            break;
                        case 'logTimeOnPageAndScrolls':
                            console.log("LoggingDB logTimeOnPageAndScrolls");
                            var webpages = result['WebPages'];
                            var found = false;
                            for (var i = 0; i < webpages.length; i++) {
                                if (webpages[i].url === global.page_url) {
                                    found = true;
                                    webpages[i].numScrollEvents = webpages[i].numScrollEvents + data.numScrollEvents;
                                    webpages[i].timeOnPage = webpages[i].timeOnPage + data.timeOnPage;
                                    break;
                                }
                            }
                            toSave = found;
                            console.log("LoggingDB logTimeOnPageAndScrolls: " + toSave);

                            break;
                        default :
                            toSave = false;
                            break;
                    }
                    break;
                default:
                    toSave = false;
            }

            if (toSave) {

                var update = objectStore.put(result);

                update.onsuccess = function (ev) {
                    var todoName = ev.target.result;
                    console.log('Successfully edited key ' + todoName);
                };

                update.onerror = function (ev) {
                    console.log('Error occured', ev.srcElement.error.message);
                };
            }

        };
    };

    // Export the tDB object.
    return tDB;

}());