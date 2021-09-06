/* eslint-disable no-undef */

import { app, BrowserWindow, screen } from "electron";
import path from "path";

import common from "./common";
import addon from "./addon";
import handlers from "./handlers";
import hotkeys from "./hotkeys";
import updater from "./updater";

const INDEX_PATH = path.join(__dirname, "..", "renderer", "index.html");
const DEV_SERVER_URL = process.env.DEV_SERVER_URL;

const params = {
    icon: common.icon,
    show: false,
    resizable: false,
    movable: false,
    transparent: true,
    frame: false,
    fullscreenable: true,
    fullscreen: true,
    flashFrame: false,
    focusable: true,
    webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        backgroundThrottling: false,
        contextIsolation: false,
        webviewTag: true,
        allowRunningInsecureContent: true,
        spellcheck: false,
        devTools: true,
        enableRemoteModule: false,
        webgl: false,
        enableWebSQL: false,
        v8CacheOptions: "none",
        additionalArguments: ["--js-flags=--max-old-space-size=128 --stack-size=128"]
    }
};

let window = null;

export default {
    create: () => {
        const { width, height } = screen.getPrimaryDisplay().bounds;
        params.width = width;
        params.height = height;

        window = new BrowserWindow(params);
        const addonInstance = addon.init(window);

        window.setSkipTaskbar(true);
        window.showInactive();
        window.removeMenu();
        window.setIgnoreMouseEvents(true);
        window.setContentProtection(common.storage.config.settings.contentProtection);
        window.setAlwaysOnTop(true, "screen-saver");
        common.isDev ? window.loadURL(DEV_SERVER_URL) : window.loadFile(INDEX_PATH);

        if (common.isDev || common.storage.config.settings.devtools) {
            window.openDevTools({ mode: "undocked" });
        }

        window.webContents.once("dom-ready", () => {
            updater.init(window).interval(60 * 1000 * 5);
            addonInstance.moveTop(window).interval(4000);
            addonInstance.clearMemory().interval(70000);
        });

        window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

        handlers.register(window);
        hotkeys.register(window);
        hotkeys.registerIndexHotkeys(window);

        return window;
    },
    close: () => {
        window.on("close", () => {
            window = null;
            app.quit();
        });

        window.close();
    }
};