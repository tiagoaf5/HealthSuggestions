// Inspired in common-web
// https://github.com/keen/common-web

(function() {
    var options = {
        pageviewsEventName: "pageviews",
        clicksEventName: "clicks",
        globalProperties: {
            page_url: window.location.href,
            referrer_url: document.referrer
        },
        sessionProperties : {
            ip: ""
        }
    };

    // create a common namespace with options
    var TrackingSystem = {
        options: options
    };

    TrackingSystem.addGlobalProperties = function(properties) {
        $.extend(TrackingSystem.options.globalProperties, properties);
    };



    TrackingSystem.trackSearch = function(callback) {
        chrome.storage.local.get('healthSuggestions_guid', function(result) {
            var guid = null;

            if ($.isEmptyObject((result))) {
                console.log("Generating guid..")

                var genSub = function () {
                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                };

                guid = genSub() + genSub() + "-" + genSub() + "-" +
                    genSub() + "-" + genSub() + "-" + genSub() + genSub() + genSub();


                chrome.storage.local.set({'healthSuggestions_guid': guid});
            }
            else {
                guid = result['healthSuggestions_guid'];
            }


            TrackingSystem.addGlobalProperties({'guid': guid});

            if(TrackingSystem.options.sessionProperties.ip === "") {

                //last function run in this function (because getLocalIPs is async)
                var setIp = function(ips) {
                    console.log("ips: " + ips);
                    if (ips[0].indexOf(':') == -1)
                        TrackingSystem.options.sessionProperties.ip = ips[1];
                    else
                        TrackingSystem.options.sessionProperties.ip = ips[0];

                    console.log("options_w_ip: " + JSON.stringify(TrackingSystem.options.sessionProperties));

                    // Ad-blocker blocking call
                    /*$.getJSON('http://www.telize.com/geoip', function(data) {
                     console.log(":::::>" + JSON.stringify(data));
                     });*/

                    sendData('Session', $.extend(true, {guid: TrackingSystem.options.globalProperties.guid},
                        TrackingSystem.options.sessionProperties));

                    if (typeof(callback) === "function")
                        callback(guid);
                };

                /**
                 * http://stackoverflow.com/a/29514292/3067252
                 */
                var getLocalIPs = function () {
                    var ips = [];

                    var RTCPeerConnection = window.RTCPeerConnection ||
                        window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

                    var pc = new RTCPeerConnection({
                        // Don't specify any stun/turn servers, otherwise you will
                        // also find your public IP addresses.
                        iceServers: []
                    });
                    // Add a media line, this is needed to activate candidate gathering.
                    pc.createDataChannel('');

                    // onicecandidate is triggered whenever a candidate has been found.
                    pc.onicecandidate = function(e) {
                        if (!e.candidate) {
                            setIp(ips);
                            return;
                        }
                        var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
                        if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
                            ips.push(ip);
                    };
                    pc.createOffer(function(sdp) {
                        pc.setLocalDescription(sdp);
                    }, function onerror() {});
                };
                /**
                 * JavaScript Client Detection
                 * (C) viazenetti GmbH (Christian Ludwig)
                 * http://stackoverflow.com/a/18706818/3067252
                 */
                var get_user_info = function () {
                    var unknown = '-';

                    // screen
                    var screenSize = '';
                    if (screen.width) {
                        width = (screen.width) ? screen.width : '';
                        height = (screen.height) ? screen.height : '';
                        screenSize += '' + width + " x " + height;
                    }

                    //searchEngineBeingUsed
                    var nVer = navigator.appVersion;
                    var nAgt = navigator.userAgent;
                    var browser = navigator.appName;
                    var version = '' + parseFloat(navigator.appVersion);
                    var majorVersion = parseInt(navigator.appVersion, 10);
                    var nameOffset, verOffset, ix;

                    // Opera
                    if ((verOffset = nAgt.indexOf('Opera')) != -1) {
                        browser = 'Opera';
                        version = nAgt.substring(verOffset + 6);
                        if ((verOffset = nAgt.indexOf('Version')) != -1) {
                            version = nAgt.substring(verOffset + 8);
                        }
                    }
                    // MSIE
                    else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
                        browser = 'Microsoft Internet Explorer';
                        version = nAgt.substring(verOffset + 5);
                    }
                    // Chrome
                    else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
                        browser = 'Chrome';
                        version = nAgt.substring(verOffset + 7);
                    }
                    // Safari
                    else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
                        browser = 'Safari';
                        version = nAgt.substring(verOffset + 7);
                        if ((verOffset = nAgt.indexOf('Version')) != -1) {
                            version = nAgt.substring(verOffset + 8);
                        }
                    }
                    // Firefox
                    else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
                        browser = 'Firefox';
                        version = nAgt.substring(verOffset + 8);
                    }
                    // MSIE 11+
                    else if (nAgt.indexOf('Trident/') != -1) {
                        browser = 'Microsoft Internet Explorer';
                        version = nAgt.substring(nAgt.indexOf('rv:') + 3);
                    }
                    // Other browsers
                    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                        browser = nAgt.substring(nameOffset, verOffset);
                        version = nAgt.substring(verOffset + 1);
                        if (browser.toLowerCase() == browser.toUpperCase()) {
                            browser = navigator.appName;
                        }
                    }
                    // trim the version string
                    if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
                    if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
                    if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

                    majorVersion = parseInt('' + version, 10);
                    if (isNaN(majorVersion)) {
                        version = '' + parseFloat(navigator.appVersion);
                        majorVersion = parseInt(navigator.appVersion, 10);
                    }

                    // mobile version
                    var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

                    // system
                    var os = unknown;
                    var clientStrings = [
                        {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
                        {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
                        {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
                        {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
                        {s:'Windows Vista', r:/Windows NT 6.0/},
                        {s:'Windows Server 2003', r:/Windows NT 5.2/},
                        {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
                        {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
                        {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
                        {s:'Windows 98', r:/(Windows 98|Win98)/},
                        {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
                        {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
                        {s:'Windows CE', r:/Windows CE/},
                        {s:'Windows 3.11', r:/Win16/},
                        {s:'Android', r:/Android/},
                        {s:'Open BSD', r:/OpenBSD/},
                        {s:'Sun OS', r:/SunOS/},
                        {s:'Linux', r:/(Linux|X11)/},
                        {s:'iOS', r:/(iPhone|iPad|iPod)/},
                        {s:'Mac OS X', r:/Mac OS X/},
                        {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
                        {s:'QNX', r:/QNX/},
                        {s:'UNIX', r:/UNIX/},
                        {s:'BeOS', r:/BeOS/},
                        {s:'OS/2', r:/OS\/2/},
                        {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
                    ];
                    for (var id in clientStrings) {
                        var cs = clientStrings[id];
                        if (cs.r.test(nAgt)) {
                            os = cs.s;
                            break;
                        }
                    }

                    var osVersion = unknown;

                    if (/Windows/.test(os)) {
                        osVersion = /Windows (.*)/.exec(os)[1];
                        os = 'Windows';
                    }

                    switch (os) {
                        case 'Mac OS X':
                            osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                            break;

                        case 'Android':
                            osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                            break;

                        case 'iOS':
                            osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                            osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                            break;
                    }




                    /*return {
                     screen: screenSize,
                     searchEngineBeingUsed: searchEngineBeingUsed,
                     browserVersion: version,
                     mobile: mobile,
                     os: os,
                     osVersion: osVersion,
                     };*/
                    return {
                        browser: browser + " " + version,
                        os: os + " " + osVersion
                    };
                };

                //TrackingSystem.addGlobalProperties(get_user_info());
                $.extend(TrackingSystem.options.sessionProperties, get_user_info());
                getLocalIPs(); //asynchronous call -> calls setIP when done
            }


        });





    };

    TrackingSystem.trackPageView = function () {

        var defaultProperties = TrackingSystem.options.globalProperties;
        //var properties = $.extend(true, {}, defaultProperties);

        //console.log(TrackingSystem.options.pageviewsEventName + ": " + JSON.stringify(properties));
        console.log("trackPageView: " + JSON.stringify({page_url: defaultProperties.page_url,
                referrer_url: defaultProperties.referrer_url}));

    };

    TrackingSystem.trackCopy = function () {
        var getSelection = function() {
            var t = '';
            if(window.getSelection){
                t = window.getSelection();
            }else if(document.getSelection){
                t = document.getSelection();
            }else if(document.selection){
                t = document.selection.createRange().text;
            }
            return t;
        };

        var selection;
        $(document).bind({
            copy: function() {
                selection = getSelection();
                console.log('copy: "' + selection + '"');
                sendData(TABLE_EVENT, {EventType: 'copy', copyText: selection.toString()});
            },
            cut: function() {
                selection = getSelection();
                console.log('cut: "' + selection + '"');
                sendData(TABLE_EVENT, {EventType: 'copy', copyText: selection.toString()});
            }
        });
    };

    // no way to know what user is finding
    TrackingSystem.trackFind = function () {
        var keydown = null;

        $(window).keydown(function(e) {
            if ( ( e.keyCode == 70 && ( e.ctrlKey || e.metaKey ) ) ||
                ( e.keyCode == 191 ) ) {
                keydown = new Date().getTime();
            }

            return true;
        }).blur(function() {
            if ( keydown !== null ) {
                var delta = new Date().getTime() - keydown;
                if ( delta >= 0 && delta < 1000 ) {
                    sendData(TABLE_EVENT, {EventType: 'find'});
                    console.log('finding...');
                }

                keydown = null;
            }
        });
    };

    TrackingSystem.trackScroll = function() {
        window.onscroll = function (e) {
            console.log("scroll");
        }
    };

    //TrackingSystem.logPa

    TrackingSystem.logSuggestionBoard = function(action) {
        switch (action) {
            case 'minimize':
                sendData(TABLE_EVENT, {EventType: 'HideSugBoard'});
                break;
            case 'maximize':
                sendData(TABLE_EVENT, {EventType: 'ShowSugBoard'});
                break;

            case 'close':
                sendData(TABLE_EVENT, {EventType: 'CloseSugBoard'});
                break;
        }
        console.log("logSuggestionBoard: " + action);
    };

    TrackingSystem.trackClicks = function() {
        $(document).on('click', 'a', function(e) {
            console.log("trackClick: " + $(this).text() + " url: " + e.target + " button: " + e.which);
        });
    };

    TrackingSystem.trackSERPClicks = function() {
        //bing, google, yahoo
        $("ol#b_results > li.b_algo > div.b_title > h2 > a, div.srg > li h3.r a, .dd.algo div.compTitle > h3.title > a")
            .on('click',function(e){
                var title = $(this).text();
                var url = $(this).attr("href");
                var button = e.which;

                if (url.indexOf('http://r.search.yahoo.com/') === 0) {
                    console.log($(this).parent().tagName);
                    console.log($(this).parent().parent().attr("class"));
                    url = $(this).parent().parent().find("div > span.wr-bw").text();
                }
                console.log("trackSERPClicks (Results): " + title + " -> " + url + " - " + button);
                sendData(TABLE_EVENT, {EventType: 'ClickSearchResult', linkText: title, button: button, title: title, link: url});
            });

        //bing, bing, google, yahoo
        $("ol#b_context ul.b_vList > li > a, div.b_rs > div.b_rich > div.b_vlist2col > ul > li > a, " +
            "div#brs > div > div > p > a," +
            "div.dd.AlsoTry > table tr > td > a").on('click', function(e) {
            //var linkText = $(this).attr('href');
            //linkText = linkText.indexOf('/') === 0 ? ENGINE_BASE_URL[searchEngineBeingUsed] + linkText : linkText;
            var suggestion = $(this).text();
            var button = e.which;

            sendData(TABLE_EVENT, {EventType: 'ClickSERelatedSearch', linkText: suggestion, button: button, suggestion: suggestion});
            console.log("trackSERPClicks (Suggestions): " + suggestion + " - " + linkText + " - " + button);
        });
    };

    TrackingSystem.logPanelSuggestions = function(e, button) {
        var term = e.text();
        var type = e.attr('data-suggestion-type');
        var lang = e.attr('data-suggestion-lang');

        console.log("trackPanelSuggestions: " + term + " (" + type +
            ", " + lang +")");
        sendData(TABLE_EVENT, {EventType: 'ClickSuggestion', linkText: term, button: button, suggestion: {term: term, lang: lang, type: type}})
    };

    TrackingSystem.logPanelSwitchSearchEngine = function(e, currentEngine) {
        var newEngine = e.attr('data-search-engine');
        if (currentEngine != newEngine) {
            console.log("trackPanelSwitchSearchEngine: from " + currentEngine + " to " + newEngine);
            sendData(TABLE_EVENT, {EventType: 'SwitchSE', from: currentEngine, to: newEngine});
        }
    };

    //TODO: fix trackGoBack
    TrackingSystem.trackGoBack = function() {

        if (window.history && window.history.pushState) {
            $(window).on('popstate', function() {

                var hashLocation = location.hash;
                var hashSplit = hashLocation.split("#!/");
                var hashName = hashSplit[1];

                if (hashName !== '') {
                    var hash = window.location.hash;
                    if (hash === '') {
                        console.log('trackGoBack: Back button was pressed.');
                    }
                }
                window.history.back();
            });

            window.history.pushState('forward', null, './#forward');
        }


    };

    TrackingSystem.getSEResults = function (se) {
        var results = undefined;
        var searchEngine = {};
        searchEngine['name'] = se;

        var searchPages = {};
        searchPages['SERPOrder'] = 1; //TODO: think about it
        searchPages['totalTimeOverSearchPage'] = "";
        searchPages['totalTimeOverSuggestionBoard'] = "";
        searchPages['timestamp'] = new Date().toJSON();
        searchPages['url'] = TrackingSystem.options.globalProperties.page_url;



        switch(se){
            case GOOGLE:
                results = getGoogleResults();
                searchEngine['url'] = G_GOOGLE_BASE_URL;
                break;
            case BING:
                results = getBingResults();
                searchEngine['url'] = G_BING_BASE_URL;
                break;
            case YAHOO:
                results = getYahooResults();
                searchEngine['url'] = G_YAHOO_BASE_URL;
                break;
            default :
                return;

        }

        searchPages['SearchResults'] = results;
        searchPages['SearchEngine'] = searchEngine;

        console.log("--------------------------------------");
        console.log(results);
        console.log("--------------------------------------");

        sendData(TABLE_SEARCH_PAGE, searchPages);
    };



    //AUXILIARY
    function sendData(table, data) {
        chrome.runtime.sendMessage({action: LOG, logTable: table, global: TrackingSystem.options.globalProperties, data: data});
    };

    function extractNumbers(results) {
        var re = /([0-9].?)+/g;
        var m = results.match(re);
        return m;
    }

    function getGoogleResults() {
        console.log("Google results: ");
        var results = $("#resultStats").html().replace(/&nbsp;/gi,'');

        var m = extractNumbers(results);
        var n_results = m[0].trim();
        var time = m[1].trim();

        var data = {totalNoResults: n_results, answerTime: time, results: []};
        var data_results = data.results;

        $("div.srg > li").each(function (index) {
            var title = $(this).find("h3.r a").text();
            var url = $(this).find("h3.r a").attr("href");
            var snippet = $(this).find("span.st").text();
            //console.log(snippet);
            //console.log(index + ": " + title + " -> " + url);
            data_results.push({index: index, title: title, snippet: snippet, url: url});
        });

        data['SERelatedSearches'] = [];
        console.log(":::SERelatedSearch")
        $("div#brs > div > div > p > a").each(function(index) {
            data['SERelatedSearches'].push($(this).text());
            console.log(index + ": " + $(this).text());
        });

        return data;
    }

    function getBingResults() {
        console.log("Bing results: ");
        var results = $("#b_tween > span.sb_count").html().replace(/&nbsp;/gi,'');
        console.log("results -> " + results);

        var m = extractNumbers(results);
        var n_results = m[0].trim();

        var data = {totalNoResults: n_results, results: []};
        var data_results = data.results;


        $("ol#b_results > li.b_algo").each(function (index) {
            var title = $(this).find("div.b_title > h2 > a").text();
            var url = $(this).find("div.b_title > h2 > a").attr("href");
            var snippet = $(this).find("div.b_caption > p").text();
            //console.log(index + ": " + title + " -> " + url);
            //console.log(snippet);
            data_results.push({index: index, title: title, snippet: snippet, url: url});
        });

        data['SERelatedSearches'] = [];
        console.log(":::SERelatedSearch")
        $("ol#b_context ul.b_vList > li > a").each(function(index) {
            data['SERelatedSearches'].push($(this).text());
            console.log(index + ": " + $(this).text());
        });

        return data;
    }

    function getYahooResults() {
        console.log("Yahoo results: ");
        var results = $("ol.searchBottom div.compPagination > span").html().replace(",", "");
        console.log("results -> " + results);

        var m = extractNumbers(results);
        var n_results = m[0].trim();

        var data = {totalNoResults: n_results, results: []};
        var data_results = data.results;

        $(".dd.algo").each(function (index) {
            var title = $(this).find("div.compTitle > h3.title > a").text();
            var url = $(this).find("div.compTitle > div > span.wr-bw").text();
            var snippet = $(this).find("div.compText > p").text();
            //console.log(index + ": " + title + " -> " + url);
            //console.log(snippet);
            data_results.push({index: index, title: title, snippet: snippet, url: url});

        });

        data['SERelatedSearches'] = [];
        console.log(":::SERelatedSearch")
        $("div.dd.AlsoTry > table tr > td > a").each(function(index) {
            data['SERelatedSearches'].push($(this).text());
            console.log(index + ": " + $(this).text());
        });

        return data;
    }




    window.TrackingSystem = TrackingSystem;
})();