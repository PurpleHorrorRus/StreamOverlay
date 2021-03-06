/* eslint-disable no-undef */

import { app, BrowserWindow, globalShortcut, ipcMain, screen } from "electron";

import addon from "overlayaddon";
import path from "path";

import { default as common } from "./common";

import { default as updater } from "./updater";

const { autoUpdater } = updater;
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
    focusable: true,
    flashFrame: false,
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

let mouse = false,
    menu = false;

const registerHandler = (event, handler) => {
    try {
        ipcMain.handle(event, handler);
    } catch (e) {
        //
    }
};

const moveTop = () => {
    if (window && !menu) {
        addon.MoveTop();
        window.showInactive();
    }
};

const send = (event, content) => {
    if (window) {
        window.webContents.send(event, content);
    }
};

export default {
    create: () => {
        const { width, height } = screen.getPrimaryDisplay().bounds;
        params.width = width;
        params.height = height;

        window = new BrowserWindow(params);
        addon.InitWindow(window.getNativeWindowHandle(), path.basename(process.execPath));

        window.setSkipTaskbar(true);
        window.showInactive();
        window.removeMenu();
        window.setIgnoreMouseEvents(true);
        window.setContentProtection(common.config.settings.contentProtection);
        window.setAlwaysOnTop(true, "screen-saver");
        common.isDev ? window.loadURL(DEV_SERVER_URL) : window.loadFile(INDEX_PATH);

        if (common.isDev || common.config.settings.devtools) {
            window.openDevTools();
        }

        window.on("close", () => {
            window = null;
            app.quit();
        });

        window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

        window.webContents.once("dom-ready", () => {
            autoUpdater.on("update-available", info => send("update-available", info));
            autoUpdater.checkForUpdates();

            if (!common.isDev) {
                addon.SetLowPriority();
                addon.ReduceWorkingSet();

                setInterval(() => {
                    addon.SetLowPriority();

                    if (common.config.settings.RAMClean) {
                        addon.ReduceWorkingSet();
                    }
                }, 70000);
            }

            moveTop();
            setInterval(moveTop, 4000);
        });

        registerHandler("config", () => common.config);
        registerHandler("FindWindow", (_, window) => addon.FindWindow(window));

        ipcMain.on("saveSettings", (_, args) => common.saveSettings(args.type, args.content));

        ipcMain.on("turnMouse", (_event, sequence) => {
            if (window) {
                window.setIgnoreMouseEvents(!sequence);
                mouse = sequence;
                menu = sequence;
                send("lock", sequence);
            }
        });

        globalShortcut.register("Alt+A", () => {
            if (window) {
                if (menu) {
                    window.setIgnoreMouseEvents(mouse);
                    mouse = !mouse;
                    send("lock", mouse);
                }
            }
        });

        const registerViewersListHotkey = () => globalShortcut.register("Alt+K", () => send("viewers_list"));

        globalShortcut.register("Alt+R", () => {
            if (window) {
                window.setIgnoreMouseEvents(menu);
                menu = !menu;
                send("menu", menu);

                if (menu) {
                    globalShortcut.register("Alt+A", () => {
                        window.setIgnoreMouseEvents(mouse);
                        mouse = !mouse;
                        send("lock", mouse);
                    });

                    globalShortcut.unregister("Alt+K");

                    window.focus();
                } else {
                    globalShortcut.unregister("Alt+A");
                    registerViewersListHotkey();
                }
            }
        });

        registerViewersListHotkey();

        return window;
    }
};