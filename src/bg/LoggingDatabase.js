var logDB = (function () {
    var tDB = {};
    var datastore = null;

    /**
     * Open a connection to the datastore.
     */
    tDB.open = function(callback) {
        // Database version.
        var version = 1;

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

    tDB.addEvent = function(hash, event, callback) {

    };

    // Export the tDB object.
    return tDB;

}());