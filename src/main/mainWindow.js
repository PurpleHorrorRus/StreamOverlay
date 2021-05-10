/* eslint-disable no-undef */

import { app, BrowserWindow, globalShortcut, Menu, Tray, ipcMain, screen } from "electron";

import addon from "overlayaddon";
import path from "path";

import { default as common } from "./common";
const { icon, isDev, config } = common;

import { default as updater } from "./updater";
const { autoUpdater } = updater;
const INDEX_PATH = path.join(__dirname, "..", "renderer", "index.html");
const DEV_SERVER_URL = process.env.DEV_SERVER_URL;

const params = {
    icon,
    show: false,
    resizable: false,
    movable: false,
    transparent: true,
    frame: false,
    fullscreenable: true,
    fullscreen: true,
    alwaysOnTop: true,
    flashFrame: false,
    webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        nodeIntegrationInWorker: false,
        backgroundThrottling: true,
        contextIsolation: false,
        webviewTag: true,
        allowRunningInsecureContent: true,
        spellcheck: false,
        devTools: isDev,
        enableRemoteModule: false,
        webgl: false,
        enableWebSQL: false,
        v8CacheOptions: "none",
        additionalArguments: ["--js-flags=--max-old-space-size=128 --stack-size=128"]
    }
};

let window = null,
    tray = null;

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

const { width, height } = screen.getPrimaryDisplay().workAreaSize;
params.width = width;
params.height = height;

window = new BrowserWindow(params);
addon.InitWindow(window.getNativeWindowHandle(), path.basename(process.execPath));

window.setSkipTaskbar(true);
window.showInactive();
window.removeMenu();
window.setIgnoreMouseEvents(true);
window.setContentProtection(config.settings.contentProtection);
window.setAlwaysOnTop(true, "screen-saver");

tray = new Tray(icon);
tray.setToolTip("Stream Overlay");
tray.setContextMenu(
    Menu.buildFromTemplate([
        { label: "Показать", type: "normal" },
        { type: "separator" },
        { label: "Выход", type: "normal", click: app.exit }
    ])
);

tray.on("double-click", () => {
    moveTop();
    window.setAlwaysOnTop(true, "screen-saver");
});

if (isDev) {
    window.loadURL(DEV_SERVER_URL);
    window.openDevTools();
} else {
    window.loadFile(INDEX_PATH);
}

window.on("close", () => {
    window = null;
    app.quit();
});

window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

const send = (event, content) => {
    if (window) {
        window.webContents.send(event, content);
    }
};

window.webContents.once("dom-ready", () => {
    autoUpdater.on("update-available", info => send("update-available", info));
    autoUpdater.checkForUpdates();

    if (!isDev) {
        addon.SetLowPriority();
        setInterval(() => addon.SetLowPriority(), 30000);
        setInterval(() => addon.ReduceWorkingSet(), 70000);
    }

    moveTop();
    setInterval(moveTop, 4000);
});

registerHandler("config", () => config);
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

globalShortcut.register("Alt+T", () => {
    send("beep");
    moveTop();
});

globalShortcut.register("Alt+R", () => {
    if (window) {
        window.setIgnoreMouseEvents(menu);
        menu = !menu;
        send("menu", menu);
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

globalShortcut.register("Alt+K", () => send("viewers_list"));