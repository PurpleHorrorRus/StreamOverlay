import { app } from "electron";
import { autoUpdater } from "electron-updater";

// eslint-disable-next-line no-unused-vars
import common from "./common";

autoUpdater.currentVersion = app.getVersion();
autoUpdater.autoDownload = true;

autoUpdater.on("error", () => {
    return;
});

autoUpdater.on("update-downloaded", () => autoUpdater.quitAndInstall(false, true));
// 60 * 1000 * 5
export default {
    init: window => {
        autoUpdater.on("download-progress", progress => common.windows.send(window, "download-progress", progress));
        autoUpdater.on("update-available", info => common.windows.send(window, "update-available", info));
        autoUpdater.checkForUpdates();

        return {
            interval: timeout => setInterval(() => autoUpdater.checkForUpdates(), timeout)
        };
    }
};