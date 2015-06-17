window.addEvent("domready", function () {
    // Option 1: Use the manifest:
    new FancySettings.initWithManifest(function (settings) {
        /*settings.manifest.myButton.addEvent("action", function () {
         alert("You clicked me!");
         });*/
        settings.manifest.database.addEvent("action", function () {
            if(document.querySelector('input[value="local"]').checked) {
                localStorage.setItem("populateTotal", 0);
                var bkg = chrome.extension.getBackgroundPage();
                var progress = 0;

                alert("You clicked me!");

                var x = document.createElement("progress");
                x.addClass("test_bar");
                x.setAttribute("max", "100");
                x.setAttribute("value", progress);
                //document.getElementById("content").appendChild(x);
                document.querySelector('input[value="local"]').parentNode.appendChild(x);

                var total = bkg.NO_DATABASE_ENTRIES;
                (function myLoop (i) {
                    setTimeout(function () {
                        progress = (Number(localStorage.getItem("populateTotal")) * 100)/total;
                        document.getElementsByClassName("test_bar")[0].setAttribute("value", progress);
                        if(progress >= 99) {
                            console.log("DONE!!");
                            i = 1;
                        }
                        if (--i) myLoop(i);      //  decrement i and call myLoop again if i > 0
                    }, 1000)
                })(3600);


                bkg.DB.populateDatabase();

                window.onbeforeunload = function (e) {
                    if (progress < 99)
                        return 'Leaving this page may avoid correctly deployment of the local database.';
                    else
                        return;
                };
                
            }
            else {
                document.getElementsByTagName("progress")[0].remove();
            }
        });

    });

    // Option 2: Do everything manually:
    /*
     var settings = new FancySettings("My Extension", "icon.png");

     var username = settings.create({
     "tab": i18n.get("information"),
     "group": i18n.get("login"),
     "name": "username",
     "type": "text",
     "label": i18n.get("username"),
     "text": i18n.get("x-characters")
     });

     var password = settings.create({
     "tab": i18n.get("information"),
     "group": i18n.get("login"),
     "name": "password",
     "type": "text",
     "label": i18n.get("password"),
     "text": i18n.get("x-characters-pw"),
     "masked": true
     });

     var myDescription = settings.create({
     "tab": i18n.get("information"),
     "group": i18n.get("login"),
     "name": "myDescription",
     "type": "description",
     "text": i18n.get("description")
     });

     var myButton = settings.create({
     "tab": "Information",
     "group": "Logout",
     "name": "myButton",
     "type": "button",
     "label": "Disconnect:",
     "text": "Logout"
     });

     // ...

     myButton.addEvent("action", function () {
     alert("You clicked me!");
     });

     settings.align([
     username,
     password
     ]);
     */
});
