/* eslint-disable no-undef */

import { app, BrowserWindow, globalShortcut } from "electron";
import { ipcMain } from "electron-better-ipc";

import path from "path";

import { default as common } from "./common";
const { icon, isDev, config } = common;

const INDEX_PATH = path.join(__dirname, "..", "renderer", "index.html");
const DEV_SERVER_URL = process.env.DEV_SERVER_URL;

const width = 1920,
    height = 1080;

const params = {
    icon,
    width,
    height,
    resizable: false,
    movable: false,
    transparent: true,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        webviewTag: true,
        allowRunningInsecureContent: true,
        devTools: true
    }
};

let window = null;

let mouse = false,
    menu = false;

const open = () => {
    window = new BrowserWindow(params);
    window.maximize();
    window.removeMenu();
    window.setIgnoreMouseEvents(true);

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

    ipcMain.answerRenderer("config", () => (config));
    ipcMain.on("saveSettings", (_, args) =>
        common.saveSettings(args.type, args.content)
    );

    globalShortcut.register("Alt+R", () => {
        if (!window) return;
        window.setIgnoreMouseEvents(menu);
        menu = !menu;
        send("menu", menu);
    });

    globalShortcut.register("Alt+A", () => {
        if (!window) return;
        if (menu) {
            window.setIgnoreMouseEvents(mouse);
            mouse = !mouse;
            send("lock", mouse);
        }
    });

    globalShortcut.register("Alt+K", () => send("viewers_list"));

    ipcMain.on("enableMouse", () => {
        if (!window) return;
        window.setIgnoreMouseEvents(false);
        mouse = true;
        send("lock", mouse);
        menu = true;
    });

    ipcMain.on("disableMouse", () => {
        if (!window) return;
        window.setIgnoreMouseEvents(true);
        mouse = false;
        send("lock", mouse);
        menu = false;
    });

    setInterval(() => {
        if (!window) return;
        window.setAlwaysOnTop(true, "screen-saver");
        window.setVisibleOnAllWorkspaces(true);
        window.setFullScreenable(true);
    }, 2000);
};

app.on("ready", open);
app.on("window-all-closed", () => app.quit());