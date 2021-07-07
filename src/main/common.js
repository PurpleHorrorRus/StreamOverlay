/* eslint-disable no-undef */
import { app } from "electron";
import fs from "fs";
import path from "path";

app.getVersion = () => "0.9.0";

const icon = path.join("build", "icons", "icon.ico");
const isDev = process.env.NODE_ENV === "development";

const readJSON = dir => JSON.parse(fs.readFileSync(dir, "UTF-8"));
const writeJSON = (dir, content) => {
    fs.writeFileSync(dir, JSON.stringify(content, null, 4));
    return content;
};

const saveSettings = (type = "settings", content) => {
    config[type] = content;
    writeJSON(paths[type], content);
};

const clearSettings = {
    first: true,
    contentProtection: true,
    RAMClean: false,
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
        height: 160
    },
    OBSStatus: {
        enable: true,
        x: 0,
        y: 0
    },
    TwitchInfo: {
        enable: true,
        enableFollowers: true,
        x: 0,
        y: 0
    },
    TechInfo: {
        enable: true,
        x: 0,
        y: 0,
        width: 180,
        height: 104
    },
    viewers_list: {
        enable: false,
        x: 0,
        y: 0,
        width: 192,
        height: 219
    },
    time: true
};

const clearTwitch = {
    id: 0,
    username: "",
    access_token: "",
    oauth_token: ""
};

const clearOBS = {
    address: "localhost",
    port: 4444,
    password: "",
    camera: []
};

const clearOverlays = [];
const clearRecent = [];

const appdata = app.getPath("userData");
const configPath = path.join(appdata, "config");

if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
}

const spath = isDev ? path.join(configPath, "StreamOverlayStandart") : configPath;

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

const paths = {
    spath,
    settings: dataPath("settings.json"),
    twitch: dataPath("twitch.json"),
    OBS: dataPath("obs.json"),
    overlays: dataPath("overlays.json"),
    recent: dataPath("recent.json")
};

const config = {
    settings: data(paths.settings, clearSettings),
    twitch: data(paths.twitch, clearTwitch),
    OBS: data(paths.OBS, clearOBS),
    overlays: data(paths.overlays, clearOverlays),
    recent: data(paths.recent, clearRecent)
};

export default {
    icon,
    isDev,
    paths,
    config,
    readJSON,
    writeJSON,
    exist,
    saveSettings,
    readSettings: (type = "settings") => readJSON(paths[type])
};