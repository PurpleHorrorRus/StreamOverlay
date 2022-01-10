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
        OBSStatus: {
            enable: true,
            time: true,
            x: -37,
            y: 1022,
            TwitchInfo: {
                enable: true,
                enableFollowers: true
            }
        },
        TechInfo: {
            enable: true,
            x: 0,
            y: 0,
            width: 300,
            height: 300
        },
        ViewersList: {
            enable: false,
            x: 1721,
            y: 801,
            width: 192,
            height: 219
        }
    },
    twitch: {
        username: "",
        access_token: "",
        oauth_token: ""
    },
    OBS: {
        address: "localhost",
        port: 4444,
        password: "",
        camera: []
    },
    widgets: [],
    recent: []
};

const readJSON = dir => JSON.parse(fs.readFileSync(dir, "UTF-8"));
const writeJSON = (dir, content) => {
    fs.writeFileSync(dir, JSON.stringify(content, null, 4));
    return content;
};

const appdata = app.getPath("userData");

const configPath = path.join(appdata, "config");
if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
}

const spath = isDev ? path.join(configPath, "StreamOverlay") : configPath;
if (!fs.existsSync(spath)) {
    fs.mkdirSync(spath);
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

const dataPath = filename => path.join(spath, filename);
const exist = path => fs.existsSync(path);
const data = (path, clear) => (exist(path) ? nested(readJSON(path), clear) : writeJSON(path, clear));

if (exist(path.join(spath, "overlays.json"))) {
    fs.renameSync(path.join(spath, "overlays.json"), path.join(spath, "widgets.json"));
}

const paths = {
    spath,
    settings: dataPath("settings.json"),
    twitch: dataPath("twitch.json"),
    OBS: dataPath("obs.json"),
    widgets: dataPath("widgets.json"),
    recent: dataPath("recent.json"),
    autoprocess: dataPath("autoprocess.json")
};

const config = {
    settings: data(paths.settings, clear.settings),
    twitch: data(paths.twitch, clear.twitch),
    OBS: data(paths.OBS, clear.OBS),
    widgets: data(paths.widgets, clear.widgets),
    recent: data(paths.recent, clear.recent)
};

export default {
    save: (type = "settings", content) => {
        config[type] = content;
        writeJSON(paths[type], content);
    },
    paths,
    config
};