/* eslint-disable no-undef */
import { app, screen } from "electron";
import fs from "fs";
import path from "path";

app.getVersion = () => "0.3.0";
app.commandLine.appendSwitch("js-flags", "--expose_gc --max-old-space-size=128");

const icon = path.join("build", "icons", "icon.ico");
const isDev = process.env.NODE_ENV === "development";

const readJSON = dir => JSON.parse(fs.readFileSync(dir, "UTF-8"));
const writeJSON = (dir, content) => {
    fs.writeFileSync(dir, JSON.stringify(content, null, 4));
    return content;
};

const saveSettings = (type = "settings", content) => {
    const path = paths[type];
    config[type] = content;
    writeJSON(path, content);
};

const bounds = screen.getPrimaryDisplay().workAreaSize;
const center = {
    x: bounds.width / 2,
    y: bounds.height / 2
};

const clearSettings = {
    first: true,
    chat: {
        enable: true,
        timeout: 80,
        opacity: 30,
        font: 12,
        x: center.x,
        y: center.y,
        width: 143,
        height: 160
    },
    OBSStatus: {
        enable: true,
        x: center.x,
        y: center.y,
        width: 174,
        height: 35
    },
    TwitchInfo: {
        x: center.x,
        y: center.y,
        width: 130,
        height: 23
    },
    TechInfo: {
        enable: true,
        x: center.x,
        y: center.y,
        width: 180,
        height: 104
    },
    viewers_list: {
        enable: false,
        x: center.x,
        y: center.y,
        width: 192,
        height: 219
    }
};

const clearTwitch = {};
const clearOBS = {};
const clearOverlays = [];

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
    overlays: dataPath("overlays.json")
};

const config = {
    settings: data(paths.settings, clearSettings),
    twitch: data(paths.twitch, clearTwitch),
    OBS: data(paths.OBS, clearOBS),
    overlays: data(paths.overlays, clearOverlays)
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

export default {
    icon, isDev, paths, config, 
    readJSON, writeJSON, exist,
    saveSettings,
    readSettings: (type = "settings") => readJSON(paths[type])
};