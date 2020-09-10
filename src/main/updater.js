import { app } from "electron";
import { autoUpdater } from "electron-updater";

import { default as common } from "./common";

autoUpdater.currentVersion = app.getVersion();
autoUpdater.autoDownload = true;

autoUpdater.on("error", () => { return; });
autoUpdater.on("update-downloaded", () => autoUpdater.quitAndInstall(false, true));

setInterval(() => autoUpdater.checkForUpdates(), 60 * 1000 * 5);

export default { autoUpdater };