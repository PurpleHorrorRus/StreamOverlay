/* eslint-disable no-undef */
import { app } from "electron";

if (app.requestSingleInstanceLock()) {
    app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
    app.disableHardwareAcceleration();
    app.on("window-all-closed", app.quit);
    app.on("ready", () => require("./mainWindow"));
} else {
    app.quit();
}