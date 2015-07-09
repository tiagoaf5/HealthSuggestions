var SETTINGS = new Store("settings", {
    "logging": true,
    "database": "local",
    "queryLanguage": "auto",
    "enabled": true
});

SETTINGS.set("logging", true);
SETTINGS.set("database", "local");
SETTINGS.set("queryLanguage", "auto");
SETTINGS.set("enabled", "true");