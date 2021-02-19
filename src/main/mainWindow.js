/* eslint-disable no-undef */

import { app, BrowserWindow, globalShortcut, Tray, Menu } from "electron";
import { ipcMain } from "electron-better-ipc";

import path from "path";

import { default as common } from "./common";
const { icon, isDev, config } = common;

import { default as updater } from "./updater";
const { autoUpdater } = updater;

const INDEX_PATH = path.join(__dirname, "..", "renderer", "index.html");
const DEV_SERVER_URL = process.env.DEV_SERVER_URL;

const width = 1920,
    height = 1080;

const params = {
    icon,
    width,
    height,
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
        contextIsolation: false,
        webviewTag: true,
        nodeIntegration: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
        devTools: true
    }
};

let window = null,
    tray = null,
    handle = null;

let mouse = false,
    menu = false;

app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

const open = () => {
    window = new BrowserWindow(params);

    window.setSkipTaskbar(true);
    window.showInactive();
    window.removeMenu();
    window.setIgnoreMouseEvents(true);
    window.setContentProtection(true);
    window.setVisibleOnAllWorkspaces(true);
    window.setAlwaysOnTop(true, "screen-saver");

    handle = window.getNativeWindowHandle();
    const moveTop = () => window && !menu ? common.moveTop(handle) : null;

    moveTop();
    setInterval(moveTop, 4000);

    tray = new Tray(icon);
    const trayMenu = Menu.buildFromTemplate([
        { label: "Показать", type: "normal" },
        { type: "separator" },
        { label: "Выход", type: "normal", click: app.exit }
    ]);

    tray.setToolTip("Stream Overlay");
    tray.setContextMenu(trayMenu);

    tray.on("double-click", () => {
        window.showInactive();
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

    const send = (event, content) => {
        if (window) {
            window.webContents.send(event, content);
        }
    };

    window.webContents.once("dom-ready", () => {
        autoUpdater.on("update-available", info => send("update-available", info));
        autoUpdater.checkForUpdates();
        
        common.setLowPriority();
        setInterval(common.setLowPriority, 30000);
    });

    ipcMain.answerRenderer("config", () => config);

    ipcMain.on("saveSettings", (_, args) =>
        common.saveSettings(args.type, args.content)
    );

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
            window.focus();
            window.setIgnoreMouseEvents(menu);
            menu = !menu;
            send("menu", menu);
        }
    });

    globalShortcut.register("Alt+A", () => {
        if (window) {
            window.setIgnoreMouseEvents(mouse);
            send("lock", !mouse);
            mouse = !mouse;
        }
    });

    globalShortcut.register("Alt+K", () => send("viewers_list"));
};

app.disableHardwareAcceleration();
app.on("ready", open);