/* eslint-disable no-undef */

import { app, BrowserWindow } from "electron";

import common from "./common";

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
        v8CacheOptions: "none"
    }
};

class MainWindow {
    constructor () {
        this.window = null;
    }

    async create() {
        this.window = new BrowserWindow(params);
        this.window.setSkipTaskbar(true);
        this.window.showInactive();
        this.window.removeMenu();
        this.window.setIgnoreMouseEvents(true);
        this.window.setContentProtection(common.storage.config.settings.contentProtection);
        this.window.setAlwaysOnTop(true, "screen-saver");
        this.window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

        if (common.isDev || common.storage.config.settings.devtools) {
            this.window.webContents.openDevTools({ mode: "undocked" });
        }

        return this.window;
    }

    async load() {
        return await common.windows.load(this.window);
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