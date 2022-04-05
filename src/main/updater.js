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
        autoUpdater.on("error", () => {
            return;
        });

        // eslint-disable-next-line max-len
        autoUpdater.on("download-progress", progress => common.windows.send(this.window, "download-progress", progress));
        autoUpdater.on("update-available", info => common.windows.send(this.window, "update-available", info));
        autoUpdater.on("update-downloaded", () => autoUpdater.quitAndInstall(true, true));
        autoUpdater.checkForUpdates();

        return {
            interval: timeout => setInterval(() => autoUpdater.checkForUpdates(), timeout)
        };
    }
}

export default Updater;