/* eslint-disable no-undef */
import { app } from "electron";

import MainWindow from "./main";
import OverlayTray from "./tray";

import common from "./common";
import Handlers from "./handlers";
import Hotkeys from "./hotkeys";

let mainWindowInstance = null;
let hotkeysInstance = null;

if (app.requestSingleInstanceLock()) {
    if (!common.storage.config.settings.hardwareAcceleration) {
        app.disableHardwareAcceleration();
    }
    
    app.commandLine.appendSwitch("enable-features", "SharedArrayBuffer");
    app.on("window-all-closed", app.quit);
    app.whenReady().then(async () => {
        mainWindowInstance = new MainWindow();
        mainWindowInstance.tray = new OverlayTray(mainWindowInstance);
        
        hotkeysInstance = new Hotkeys(mainWindowInstance.window);
        new Handlers(mainWindowInstance, hotkeysInstance);
        await mainWindowInstance.load();

        hotkeysInstance.register();
        hotkeysInstance.registerIndexHotkeys();
    });
} else {
    app.quit();
}