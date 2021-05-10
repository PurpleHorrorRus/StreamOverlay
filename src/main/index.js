/* eslint-disable no-undef */
import { app } from "electron";

import { default as mainWindow } from "./mainWindow";
import { default as tray } from "./tray";

if (app.requestSingleInstanceLock()) {
    app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
    app.disableHardwareAcceleration();
    app.on("window-all-closed", app.quit);
    app.whenReady().then(() => {
        mainWindow.create();
        tray.create();
    });
} else {
    app.quit();
}