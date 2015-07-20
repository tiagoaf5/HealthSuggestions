
//mainly inject
var G_GOOGLE_BASE_URL = "https://www.google.com";
var G_BING_BASE_URL = "https://www.bing.com";
var G_YAHOO_BASE_URL = "https://search.yahoo.com";

var G_GOOGLE_SEARCH_URL = G_GOOGLE_BASE_URL + "/search?q=";
var G_BING_SEARCH_URL = G_BING_BASE_URL + "/search?q=";
var G_YAHOO_SEARCH_URL = G_YAHOO_BASE_URL + "/search?p=";


//mainly background
//DO NOT CHANGE: inject.js loadData depending on it hardcoded
var SEARCH = "search";
var MINIMIZED = "minimized";
var CLOSED = "closed";
var SUGGESTION = "suggestion";
var PARENT = "parent";
var HASH = "query_hash";
var LOG = "log";
var TABS_SEARCH = "tabs_search";

var SEARCH_ENGINE = "search_engine";

var GOOGLE = "Google";
var BING = "Bing";
var YAHOO = "Yahoo";



var LOG_ACTIONS = {
    trackSearch: 'trackSearch',
    clickSERPResults: 'clickSERPResult',
    clickSERPSuggestions: 'clickSERPSugge',
    copy: 'copy',
    scroll: 'scroll',
    find: 'find'
};

var TAB = "tabid";

var NO_DATABASE_ENTRIES = 192691;