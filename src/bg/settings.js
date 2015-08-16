var SETTINGS = new Store("settings", {
    "logging": true,
    "database": "local",
    "queryLanguage": "auto",
    "enabled": true
});

//removed because when updating was over-riding already saved
/*
SETTINGS.set("logging", true);
SETTINGS.set("database", "local");
SETTINGS.set("queryLanguage", "auto");
SETTINGS.set("enabled", "true");*/
