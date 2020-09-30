/* eslint-disable no-undef */

import { app, BrowserView, BrowserWindow, globalShortcut } from "electron";
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
        nodeIntegration: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
        devTools: true
    }
};

let window = null;

let mouse = false,
    menu = false;

const getViewByID = id => {
    const views = BrowserView.getAllViews();
    const index = views.map(e => e.widgetID).indexOf(id);
    if (~index) {
        return views[index];
    }
};

const getOverlayIndexByID = id => config.overlays.map(o => o.id).indexOf(id);

const addWidget = widget => {
    if (window) {
        const view = new BrowserView();
        view.widgetID = widget.id;
        window.addBrowserView(view);
        view.setBounds(widget.style);
        view.webContents.loadURL(widget.src);
        view.webContents.on("dom-ready", () => view.webContents.audioMuted = true);
        view.webContents.on("before-input-event", e => e.preventDefault());
    }
};

const deleteWidget = id => {
    const view = getViewByID(id);
    if (view) {
        view.destroy();
        
        const overlayIndex = getOverlayIndexByID(id);
        if (~overlayIndex) {
            config.overlays.splice(overlayIndex, 1);
        }
    }
};

const editWidget = widget => {
    const view = getViewByID(widget.id);
    if (view) {
        const overlayIndex = getOverlayIndexByID(widget.id);
        if (~overlayIndex) {
            config.overlays[overlayIndex] = widget;
            common.saveSettings("overlays", config.overlays);
        }
    }
};

const open = () => {
    window = new BrowserWindow(params);

    window.showInactive();
    window.maximize();
    window.removeMenu();
    window.setIgnoreMouseEvents(true);
    window.setContentProtection(true);
    window.setVisibleOnAllWorkspaces(true);
    window.setAlwaysOnTop(true, "screen-saver");

    if (isDev) {
        window.loadURL(DEV_SERVER_URL);
        window.openDevTools();
    } else window.loadFile(INDEX_PATH);

    config.overlays.forEach(addWidget);

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
    ipcMain.answerRenderer("getAllWidgets", () => (config.overlays));

    ipcMain.on("addWidget", (_event, widget) => {
        config.overlays = [...config.overlays, widget];
        addWidget(widget);
    });
    ipcMain.on("removeWidget", (_event, id) => deleteWidget(id));
    ipcMain.on("editWidget", (_event, widget) => editWidget(widget));
    ipcMain.on("minimizeWidgets", () => {
        BrowserView.getAllViews()
            .forEach(v => v.setBounds({ 
                x: 0, 
                y: 0, 
                width: 0, 
                height: 0 
            }));
    });

    ipcMain.on("restoreWidgets", () => {
        BrowserView.getAllViews()
            .forEach(v => {
                const styleIndex = config.overlays.findIndex(o => o.id === v.widgetID);
                v.setBounds(config.overlays[styleIndex].style);
            });
    });

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
            menu = true;
            mouse = true;
            send("lock", true);
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