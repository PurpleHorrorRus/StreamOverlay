/* eslint-disable no-undef */
import { app } from "electron";
import fs from "fs";
import path from "path";

app.getVersion = () => "0.7.8";

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
    chat: {
        enable: true,
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

const clearTwitch = {};
const clearOBS = {};
const clearOverlays = [];
const clearRecent = [];

const appdata = app.getPath("userData");
const configPath = path.join(appdata, "config");

if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
}

const spath = isDev
    ? path.join(configPath, "StreamOverlayStandart")
    : configPath;

if (!fs.existsSync(spath)) {
    fs.mkdirSync(spath);
}
    
const dataPath = filename => path.join(spath, filename);
const exist = path => fs.existsSync(path);
const data = (path, clear) => exist(path) ? readJSON(path) : writeJSON(path, clear);

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

let keys = Object.keys(config.settings),
    clearKeys = Object.keys(clearSettings);
    
for (let key of clearKeys) {
    if (!~keys.indexOf(key)) {
        config.settings[key] = clearSettings[key];
        saveSettings("settings", config.settings);
    }

    key = null;
}

keys = clearKeys = null;

if (config.settings.TwitchInfo.enableFollowers === undefined) {
    config.settings.TwitchInfo.enable = true;
    config.settings.TwitchInfo.enableFollowers = true;
    delete config.settings.TwitchInfo.width;
    delete config.settings.TwitchInfo.height;

    delete config.settings.OBSStatus.width;
    delete config.settings.OBSStatus.height;

    saveSettings("settings", config.settings);
}

export default {
    icon, isDev, paths, config, 
    readJSON, writeJSON, exist,
    saveSettings,
    readSettings: (type = "settings") => readJSON(paths[type])
};