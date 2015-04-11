/**
 * Created by tiago on 10/03/15.
 */
var DB =  new function() {
    var baseUrl = "../../data/";
    var db = this;
    db.openDatabase = function() {
        db.database = openDatabase('mydb', '2.0', 'my first database', 100000000);
    }
    db.createDatabase = function() {
        db.openDatabase();

        db.database.transaction(function (tx) {
            //CHVConcept
            tx.executeSql("DROP TABLE IF EXISTS 'CHVConcept'");
            tx.executeSql("DROP TABLE IF EXISTS 'CHVStemmedIndexPT'");
            tx.executeSql("DROP TABLE IF EXISTS 'CHVIndexPT'");
            tx.executeSql("DROP TABLE IF EXISTS 'CHVString'");

            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS 'CHVConcept' (" +
                "'CUI' varchar(10) PRIMARY KEY," +
                "'CHV_Pref_EN' varchar(500) NOT NULL," +
                "'CHV_Pref_PT' varchar(500) NOT NULL," +
                "'UMLS_Pref_EN' varchar(500) NOT NULL," +
                "'UMLS_Pref_PT' varchar(500) NOT NULL" +
                ")"
            );

            //CHVIndexPT
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS 'CHVStemmedIndexPT' (" +
                "'term' varchar(300) PRIMARY KEY," +
                "'idf' float NOT NULL," +
                "'stringlist' mediumtext NOT NULL" +
                ")"
            );

            //CHVString
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS 'CHVString' (" +
                "'id' int(11) PRIMARY KEY," +
                "'en' varchar(500) NOT NULL," +
                "'pt' varchar(500) NOT NULL," +
                "'pt_stemmed' varchar(500) NOT NULL," +
                "'cui' varchar(10) NOT NULL" +
                ")"
            );

        });

    };

    db.populateDatabase = function() {
        if(!db.database)
            db.openDatabase();

        //Populating CHVConcept table
        $.getJSON( baseUrl + "CHVConcept.json", function( data ) {
            console.info("Populating CHVConcept table...");
            db.database.transaction(function (tx) {
                console.log("inserting...");
                for(var i = 0; i < data.length; i++) {

                    var val = data[i];

                    var insert = "INSERT INTO 'CHVConcept' ('CUI', 'CHV_Pref_EN', 'CHV_Pref_PT', 'UMLS_Pref_EN', 'UMLS_Pref_PT') VALUES(?,?,?,?,?)";



                    tx.executeSql(insert, val, nullDataHandler, killTransaction);
                }
                console.info("Done Populating CHVConcept table...");

                tx.executeSql("SELECT count(*) FROM CHVConcept", [], function (tx, results) {
                    console.log(results.rows);
                    var len = results.rows.length;
                    console.log(len);
                    for (var i = 0; i < len; i++) {
                        console.log(i + " " + JSON.stringify(results.rows.item(i)));
                    }
                });
            });
        });

        //Populating CHVIndexPT table
        $.getJSON( baseUrl + "CHVStemmedIndexPT.json", function( data ) {

            console.info("Populating CHVStemmedIndexPT table...");

            db.database.transaction(function (tx) {
                console.log("inserting...");
                for(var i = 0; i < data.length; i++) {

                    tx.executeSql("INSERT INTO 'CHVStemmedIndexPT' ('term','idf','stringlist') VALUES(?,?,?)", data[i],
                        nullDataHandler, killTransaction);
                }
                console.info("Done Populating CHVIndexPT table...");

                tx.executeSql("SELECT count(*) FROM CHVStemmedIndexPT", [], function (tx, results) {
                    console.log(results.rows);
                    var len = results.rows.length;
                    console.log(len);
                    for (var i = 0; i < len; i++) {
                        console.log(i + " " + JSON.stringify(results.rows.item(i)));
                    }
                });
            });
        });


        //Populating CHVString table
        $.getJSON( baseUrl + "CHVString.json", function( data ) {

            console.info("Populating CHVString table...");

            db.database.transaction(function (tx) {
                console.log("inserting...");
                for(var i = 0; i < data.length; i++) {

                    tx.executeSql("INSERT INTO 'CHVString' ('id','en','pt','pt_stemmed','cui') VALUES(?,?,?,?,?)", data[i],
                        nullDataHandler, killTransaction);
                }
                console.info("Done Populating CHVString table...");

                tx.executeSql("SELECT count(*) FROM CHVString", [], function (tx, results) {
                    console.log(results.rows);
                    var len = results.rows.length;
                    console.log(len);
                    for (var i = 0; i < len; i++) {
                        console.log(i + " " + JSON.stringify(results.rows.item(i)));
                    }
                });
            });
        });
    }

    db.executeSql = function(sql, params) {

        db.database.transaction(function (tx) {
            tx.executeSql(sql, params, function (tx, results) {
                var len = results.rows.length;
                for (var i = 0; i < len; i++) {
                    console.log(i + " " + JSON.stringify(results.rows.item(i)));
                }
            });
        });
    }

    db.getStringList = function(terms, callback) {

        if(!db.database)
            db.openDatabase();

        var object = {};
        db.database.readTransaction(function (tx) {

            for (var i = 0; i < terms.length; i++) {
                tx.executeSql("SELECT * FROM CHVStemmedIndexPT WHERE term = ?", [terms[i]], function (tx, results) {

                    if (results.rows.length) {
                        var result = results.rows.item(0);
                        var idf = result.idf;

                        var stringlist = (result.stringlist).split(";");


                        for (var j = 0; j < stringlist.length; j++) {
                            if(stringlist[j] != "") {
                                object[stringlist[j]] =  object.hasOwnProperty(stringlist[j]) ?  object[stringlist[j]] + idf : idf;
                            }
                        }

                    }

                });
            }

        }, /*error*/ function (transaction, error) {
            console.log("transaction: " +  transaction + "  error: " + error);
        }, /*success*/ function (transaction, results) {
            console.log("transaction: " +  transaction + "  results: " + results);
            console.log("FINAL OBJECT: " + JSON.stringify(object));
            var max = 0;
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    max = max > object[key] ? max : object[key];
                }
            }

            console.log("MAX: " + max);
            var array = [];

            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    if (object[key] == max)
                        array.push(key);
                }
            }

            console.log("MAX ARRAY: " + array);

            var cui;
            db.database.readTransaction(function (tx) {
                tx.executeSql("SELECT * FROM CHVString WHERE id = ?", [array[0]], function (tx, results) {
                    if (results.rows.length) {
                        var result = results.rows.item(0);
                        console.log("CUI: " + JSON.stringify(result));
                        cui = result["cui"];
                    }
                });
            }, /*Error*/ function (transaction, error) {
                console.log("transaction: " +  transaction + "  error: " + error);
            },/*Success*/ function (transaction, results) {
                console.log("transaction: " +  transaction + "  results: " + results);
                db.database.readTransaction(function (tx) {
                    tx.executeSql("SELECT * FROM CHVConcept WHERE CUI = ?", [cui], function (tx, results) {
                        if (results.rows.length) {
                            var result = results.rows.item(0);
                            console.log("CHVConcept: " + JSON.stringify(result));

                            callback([result["CHV_Pref_PT"], result["CHV_Pref_EN"], result["UMLS_Pref_PT"], result["UMLS_Pref_EN"]]);
                        }
                    })
                });
            });
        });
    }
};


/* This is the data handler which would be null in case of table creation and record insertion */
function nullDataHandler(transaction, results)   {
    console.log("transaction: " +  transaction + "  results: " + results);
}
/* This is the error handler */
function killTransaction(transaction, error) {
    console.log("transaction: " +  transaction + "  error: " + error);
}