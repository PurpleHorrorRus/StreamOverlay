/* eslint-disable no-undef */
import { app } from "electron";

import MainWindow from "./main";
import OverlayTray from "./tray";
import Handlers from "./handlers";
import Hotkeys from "./hotkeys";
import Addon from "./addon";
import Updater from "./updater";

import common from "./common";
import protocol from "./protocol";

let mainWindowInstance = null;

if (app.requestSingleInstanceLock()) {
    if (!common.storage.config.settings.hardwareAcceleration) {
        app.disableHardwareAcceleration();
    }

    app.commandLine.appendSwitch("enable-features", "SharedArrayBuffer");
    app.once("window-all-closed", app.quit);
    app.whenReady().then(async () => {
        if (!common.isDev) {
            protocol.register();
        }

        mainWindowInstance = new MainWindow();
        mainWindowInstance.tray = new OverlayTray(mainWindowInstance);
        mainWindowInstance.handlers = new Handlers(mainWindowInstance);

        await mainWindowInstance.create();

        mainWindowInstance.hotkeys = new Hotkeys(mainWindowInstance.window);
        mainWindowInstance.hotkeys.register();
        mainWindowInstance.hotkeys.registerIndexHotkeys();

        mainWindowInstance.addon = new Addon(mainWindowInstance.window);
        mainWindowInstance.addon.moveTop().interval(4000);
        mainWindowInstance.addon.clearMemory().interval(70000);

        mainWindowInstance.updater = new Updater(mainWindowInstance.window).init();
        mainWindowInstance.updater.interval(60 * 1000 * 5);

        return await mainWindowInstance.load();
    });
} else {
    app.quit();
}