var SETTINGS = new Store("settings", {
    "logging": true,
    "database": "local",
    "language1": "pt",
    "language2": "en",
    "enabled": true
});

SETTINGS.set("logging", true);
SETTINGS.set("database", "local");
SETTINGS.set("language1", "pt");
SETTINGS.set("language2", "en");
SETTINGS.set("enabled", "true");