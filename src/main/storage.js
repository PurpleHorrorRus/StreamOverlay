import { app } from "electron";
import path from "path";
import fs from "fs";

// eslint-disable-next-line no-undef
const isDev = process.env.NODE_ENV === "development";

const clear = {
    settings: {
        first: true,
        contentProtection: true,
        RAMClean: false,
        devtools: false,
        hardwareAcceleration: true,
        outputDeviceId: "default",

        service: "none",

        chat: {
            enable: true,
            avatar: true,
            badges: true,
            timeout: 80,
            opacity: 30,
            font: 12,
            x: 0,
            y: 0,
            width: 143,
            height: 160,
            sound: false,
            tts: {
                enable: false,
                readName: false
            }
        },

        trovo: {
            notifications: {
                welcome: true
            }
        },

        OBSStatus: {
            enable: true,
            time: true,
            tech: false,
            x: -37,
            y: 1022,

            ServiceInfo: {
                enable: true,
                followers: true
            }
        },

        ViewersList: {
            enable: false,
            x: 1721,
            y: 801,
            width: 192,
            height: 219
        },

        notifications: {
            lowfps: true,
            lowbitrate: true
        }
    },

    twitch: {
        username: "",
        access_token: "",
        oauth_token: ""
    },

    trovo: {
        access_token: "",
        refresh_token: ""
    },

    obs: {
        address: "localhost",
        port: 4444,
        password: "",
        camera: []
    },

    widgets: [],
    recent: [],

    autoprocess: {
        enable: false,
        list: []
    }
};

const readJSON = dir => JSON.parse(fs.readFileSync(dir, "UTF-8"));
const writeJSON = (dir, content) => {
    fs.writeFileSync(dir, JSON.stringify(content, null, 4));
    return content;
};

const appdata = app.getPath("userData");

const configRoot = path.join(appdata, "config");
if (!fs.existsSync(configRoot)) {
    fs.mkdirSync(configRoot);
}

const configPath = isDev ? path.join(configRoot, "StreamOverlay") : configRoot;
if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
}

const nested = (settings, clear) => {
    for (const key of Object.keys(clear)) {
        if (settings[key] === undefined) {
            settings[key] = clear[key];
        } else if (typeof settings[key] === "object" && !Array.isArray(settings[key])) {
            settings[key] = nested(settings[key], clear[key]);
        }
    }

    if (!Array.isArray(settings)) {
        for (const key of Object.keys(settings)) {
            if (clear[key] === undefined) {
                delete settings[key];
            }
        }
    }

    return settings;
};

const dataPath = filename => path.join(configPath, filename);
const exist = path => fs.existsSync(path);
const data = (path, clear) => (exist(path) ? nested(readJSON(path), clear) : writeJSON(path, clear));

const paths = {
    configPath,
    temp: path.resolve(app.getPath("temp"), "StreamOverlay"),
    settings: dataPath("settings.json"),
    twitch: dataPath("twitch.json"),
    trovo: dataPath("trovo.json"),
    obs: dataPath("obs.json"),
    widgets: dataPath("widgets.json"),
    recent: dataPath("recent.json")
};

const config = {
    settings: data(paths.settings, clear.settings),
    twitch: data(paths.twitch, clear.twitch),
    trovo: data(paths.trovo, clear.trovo),
    obs: data(paths.obs, clear.obs),
    widgets: data(paths.widgets, clear.widgets),
    recent: data(paths.recent, clear.recent)
};

export default {
    save: (type = "settings", content) => {
        config[type] = content;
        writeJSON(paths[type], content);
    },
    
    config: {
        paths,
        ...config
    }
};