/* eslint-disable no-undef */
import { app } from "electron";
import fs from "fs";
import path from "path";

app.getVersion = () => "0.0.2";
app.commandLine.appendSwitch("js-flags", "--expose_gc --max-old-space-size=128");

const icon = path.join("build", "icons", "icon.ico");
const isDev = process.env.NODE_ENV === "development";

const readJSON = dir => JSON.parse(fs.readFileSync(dir, "UTF-8"));
const writeJSON = (dir, content) => {
    fs.writeFileSync(dir, JSON.stringify(content, null, 4));
    return content;
};

const clearSettings = {
    first: true,
    chat: {
        timeout: 80,
        opacity: 30,
        font: 12,
        x: 1633,
        y: 156,
        width: 273,
        height: 556
    },
    viewers_list: {
        enable: false,
        x: 1721,
        y: 801,
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
    }

    key = null;
}

keys = clearKeys = null;

export default {
    icon, isDev, paths, config, 
    readJSON, writeJSON, exist,
    saveSettings: (type = "settings", content) => {
        const path = paths[type];
        config[type] = content;
        writeJSON(path, content);
    },
    readSettings: (type = "settings") => readJSON(paths[type])
};