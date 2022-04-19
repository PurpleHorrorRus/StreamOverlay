/* eslint-disable no-undef */

import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

import Addon from "./addon";
import Updater from "./updater";
import common from "./common";

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

class MainWindow {
    constructor () {
        this.window = new BrowserWindow(params);
        this.window.setSkipTaskbar(true);
        this.window.showInactive();
        this.window.removeMenu();
        this.window.setIgnoreMouseEvents(true);
        this.window.setContentProtection(common.storage.config.settings.contentProtection);
        this.window.setAlwaysOnTop(true, "screen-saver");
        this.addonInstance = new Addon(this.window);
        
        if (common.isDev || common.storage.config.settings.devtools) {
            this.window.webContents.openDevTools({ mode: "undocked" });
        }

        this.window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    }

    load () {
        return new Promise(resolve => {
            ipcMain.once("finish-load", () => {
                new Updater(this.window).init().interval(60 * 1000 * 5);
                this.addonInstance.moveTop().interval(4000);
                this.addonInstance.clearMemory().interval(70000);
                return resolve();
            });
    
            common.isDev ? this.window.loadURL(DEV_SERVER_URL) : this.window.loadFile(INDEX_PATH);
        });
    }

    close () {
        if (this.window.webContents.isDevToolsOpened()) {
            this.window.webContents.closeDevTools();
        }

        this.window.once("close", () => {
            this.window = null;
            app.quit();
        });

        this.window.close();
    }
}

export default MainWindow;