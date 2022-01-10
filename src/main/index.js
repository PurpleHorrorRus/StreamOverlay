/* eslint-disable no-undef */
import { app } from "electron";

import mainWindow from "./main";
import common from "./common";
import tray from "./tray";

if (app.requestSingleInstanceLock()) {
    if (!common.storage.config.settings.hardwareAcceleration) {
        app.disableHardwareAcceleration();
    }
    
    app.on("window-all-closed", app.quit);
    app.whenReady().then(() => {
        mainWindow.create();
        tray.create(mainWindow);
    });
} else {
    app.quit();
}