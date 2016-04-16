// SAMPLE
this.manifest = {
    "name": "HealthSuggestions",
    "icon": "../../icons/hearth48.png",
    "settings": [
        {
            "tab": i18n.get("settings"),
            "group": i18n.get("extension"),
            "name": "enabled",
            "label": i18n.get("enabled"),
            "type": "checkbox"
        },
        {
            "tab": i18n.get("settings"),
            "group": i18n.get("extension"),
            "name": "enabledExplained",
            "type": "description",
            "text": i18n.get("enabledExplained")
        },
        {
            "tab": i18n.get("settings"),
            "group": i18n.get("logging"),
            "name": "logging",
            "label": i18n.get("allowLogging"),
            "type": "checkbox"
        },
        {
            "tab": i18n.get("settings"),
            "group": i18n.get("logging"),
            "name": "loggingDescription",
            "type": "description",
            "text": i18n.get("description")
        },
        {
            "tab": i18n.get("settings"),
            "group": i18n.get("database"),
            "name": "database",
            "type": "radioButtons",
            "label": i18n.get("database_to_use"),
            "options": [
                {value: "remote", text: i18n.get("database_remote")},
                {value: "local", text: i18n.get("database_local")}
            ]
        },
        {
            "tab": i18n.get("settings"),
            "group": i18n.get("languages"),
            "name": "queryLanguage",
            "label": i18n.get("queryLanguage"),
            "type": "popupButton",
            "options": {
                "values": [
                    {
                        "value": "auto",
                        "text": i18n.get("auto")
                    },
                    {
                        "value": "eng",
                        "text": i18n.get("en")
                    },
                    {
                        "value": "por",
                        "text": i18n.get("pt")
                    }
                ]
            }
        },
       /* {
            "tab": i18n.get("settings"),
            "group": i18n.get("languages"),
            "name": "language2",
            "label": i18n.get("language2"),
            "type": "popupButton",
            "options": {
                "values": [
                    {
                        "value": "en",
                        "text": i18n.get("en")
                    },
                    {
                        "value": "pt",
                        "text": i18n.get("pt")
                    }
                ]
            }
        },*/
        {
            "tab": i18n.get("about"),
            "name": "aboutDescription",
            "type": "description",
            "text": i18n.get("descriptionAbout")
        },
        /*
        {
            "tab": i18n.get("information"),
            "group": i18n.get("login"),
            "name": "username",
            "type": "text",
            "label": i18n.get("username"),
            "text": i18n.get("x-characters")
        },
        {
            "tab": i18n.get("information"),
            "group": i18n.get("login"),
            "name": "password",
            "type": "text",
            "label": i18n.get("password"),
            "text": i18n.get("x-characters-pw"),
            "masked": true
        },
        {
            "tab": i18n.get("information"),
            "group": i18n.get("login"),
            "name": "myDescription",
            "type": "description",
            "text": i18n.get("description")
        },

        {
            "tab": i18n.get("information"),
            "group": i18n.get("logout"),
            "name": "myCheckbox",
            "type": "checkbox",
            "label": i18n.get("enable")
        },
        {
            "tab": i18n.get("information"),
            "group": i18n.get("logout"),
            "name": "myButton",
            "type": "button",
            "label": i18n.get("disconnect"),
            "text": i18n.get("logout")
        },
        {
            "tab": "Details",
            "group": "Sound",
            "name": "noti_volume",
            "type": "slider",
            "label": "Notification volume:",
            "max": 1,
            "min": 0,
            "step": 0.01,
            "display": true,
            "displayModifier": function (value) {
                return (value * 100).floor() + "%";
            }
        },
        {
            "tab": "Details",
            "group": "Sound",
            "name": "sound_volume",
            "type": "slider",
            "label": "Sound volume:",
            "max": 100,
            "min": 0,
            "step": 1,
            "display": true,
            "displayModifier": function (value) {
                return value + "%";
            }
        },
        {
            "tab": "Details",
            "group": "Food",
            "name": "myPopupButton",
            "type": "popupButton",
            "label": "Soup 1 should be:",
            "options": {
                "groups": [
                    "Hot", "Cold",
                ],
                "values": [
                    {
                        "value": "hot",
                        "text": "Very hot",
                        "group": "Hot",
                    },
                    {
                        "value": "Medium",
                        "group": 1,
                    },
                    {
                        "value": "Cold",
                        "group": 2,
                    },
                    ["Non-existing"]
                ],
            },
        },
        {
            "tab": "Details",
            "group": "Food",
            "name": "myListBox",
            "type": "listBox",
            "label": "Soup 2 should be:",
            "options": [
                ["hot", "Hot and yummy"],
                ["cold"]
            ]
        },
        {
            "tab": "Details",
            "group": "Food",
            "name": "myRadioButtons",
            "type": "radioButtons",
            "label": "Soup 3 should be:",
            "options": [
                ["hot", "Hot and yummy"],
                ["cold"]
            ]
        }*/
    ]/*,
    "alignment": [
        [
            "username",
            "password"
        ],
        [
            "noti_volume",
            "sound_volume"
        ]
    ]*/
};
