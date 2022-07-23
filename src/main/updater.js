import { app } from "electron";
import { autoUpdater } from "electron-updater";

// eslint-disable-next-line no-unused-vars
import common from "./common";

autoUpdater.currentVersion = app.getVersion();
autoUpdater.autoDownload = true;
class Updater {
    constructor (window) {
        this.window = window;
    }

    init () {
        autoUpdater.on("error", () => {});

        autoUpdater.on("download-progress", progress => {
            return common.windows.send(this.window, "download-progress", progress);
        });

        autoUpdater.once("update-available", info => {
            return common.windows.send(this.window, "update-available", info);
        });

        autoUpdater.once("update-downloaded", () => {
            return autoUpdater.quitAndInstall(true, true);
        });

        autoUpdater.checkForUpdates();

        return {
            interval: timeout => setInterval(() => autoUpdater.checkForUpdates(), timeout)
        };
    }
}

export default Updater;