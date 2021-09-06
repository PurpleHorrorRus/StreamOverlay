import { globalShortcut } from "electron";

import common from "./common";

let lock = false;

export default {
    register: window => {
        window.menu = false;
        window.lock = false;

        globalShortcut.register("Alt+R", () => {
            if (window) {
                window.menu = !window.menu;
                common.windows.send(window, "turnMenu", window.menu);
            }
        });
    },
    registerIndexHotkeys: window => {
        window.lock = false;

        globalShortcut.unregister("Alt+A");
        globalShortcut.register("Alt+K", () => common.windows.send(window, "turnViewersList"));
    },
    registerMenuHotkeys: window => {
        window.lock = true;

        globalShortcut.unregister("Alt+K");
        globalShortcut.register("Alt+A", () => {
            console.log("Alt+A");
            window.lock = !window.lock;
            common.windows.send(window, "turnLock", window.lock);
        });
    }
};