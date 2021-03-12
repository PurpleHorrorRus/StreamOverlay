/* eslint-disable no-undef */

import { app, BrowserWindow, globalShortcut, Tray, Menu, screen } from "electron";
import { ipcMain } from "electron-better-ipc";

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
    width: 1920,
    height: 1080,
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

app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

const open = () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    params.width = width;
    params.height = height;

    window = new BrowserWindow(params);

    window.setSkipTaskbar(true);
    window.showInactive();
    window.removeMenu();
    window.setIgnoreMouseEvents(true);
    window.setContentProtection(true);
    window.setAlwaysOnTop(true, "screen-saver");

    addon.InitWindow(window.getNativeWindowHandle(), path.basename(process.execPath));
    const moveTop = () => window && !menu ? addon.MoveTop() : null;

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

    window.webContents.on("new-window", event => event.preventDefault());

    const send = (event, content) => {
        if (window) {
            window.webContents.send(event, content);
        }
    };

    window.webContents.once("dom-ready", () => {
        autoUpdater.on("update-available", info => send("update-available", info));
        autoUpdater.checkForUpdates();
        
        addon.SetLowPriority();
        setInterval(() => addon.SetLowPriority(), 30000);
        setInterval(() => addon.ReduceWorkingSet(), 70000);
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