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
                "CREATE TABLE IF NOT EXISTS 'CHVIndexPT' (" +
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
        $.getJSON( baseUrl + "CHVIndexPT.json", function( data ) {

            console.info("Populating CHVIndexPT table...");

            db.database.transaction(function (tx) {
                console.log("inserting...");
                for(var i = 0; i < data.length; i++) {

                    tx.executeSql("INSERT INTO 'CHVIndexPT' ('term','idf','stringlist') VALUES(?,?,?)", data[i],
                        nullDataHandler, killTransaction);
                }
                console.info("Done Populating CHVIndexPT table...");

                tx.executeSql("SELECT count(*) FROM CHVIndexPT", [], function (tx, results) {
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
};


/* This is the data handler which would be null in case of table creation and record insertion */
function nullDataHandler(transaction, results)   {
    console.log("transaction: " +  transaction + "  results: " + results);
}
/* This is the error handler */
function killTransaction(transaction, error) {
    console.log("transaction: " +  transaction + "  error: " + error);
}