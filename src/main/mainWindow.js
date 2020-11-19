/* eslint-disable no-undef */

import { app, BrowserWindow, globalShortcut } from "electron";
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
    fullscreenable: false,
    webPreferences: {
        contextIsolation: false,
        webviewTag: true,
        nodeIntegration: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
        devTools: true
    }
};

let window = null;

let mouse = false,
    menu = false;

app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

const open = () => {
    window = new BrowserWindow(params);

    window.showInactive();
    window.removeMenu();
    window.setIgnoreMouseEvents(true);
    window.setContentProtection(true);
    window.setVisibleOnAllWorkspaces(true);
    window.setAlwaysOnTop(true, "screen-saver");


    if (isDev) {
        window.loadURL(DEV_SERVER_URL);
        window.openDevTools();
    } else window.loadFile(INDEX_PATH);

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
        autoUpdater.on("update-available", info => {
            send("update-available", info);
        });

        autoUpdater.checkForUpdates();
    });
    ipcMain.answerRenderer("config", () => config);

    ipcMain.on("saveSettings", (_, args) =>
        common.saveSettings(args.type, args.content)
    );


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

    ipcMain.on("enableMouse", () => {
        if (window) {
            window.setIgnoreMouseEvents(false);
            mouse = true;
            send("lock", mouse);
            menu = true;
        }
    });

    ipcMain.on("disableMouse", () => {
        if (window) {
            window.setIgnoreMouseEvents(true);
            mouse = false;
            send("lock", mouse);
            menu = false;
        }
        
    });
};

app.disableHardwareAcceleration();
app.on("ready", open);