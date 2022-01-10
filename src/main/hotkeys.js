import { globalShortcut } from "electron";

import common from "./common";

class Hotkeys {
    constructor (window) {
        this.window = window;
    }

    register () {
        this.window.menu = false;
        this.window.lock = false;

        globalShortcut.register("Alt+R", () => {
            this.window.menu = !this.window.menu;
            this.window.lock = this.window.menu;
            common.windows.send(this.window, "turnMenu", this.window.menu);
        });
    }

    registerIndexHotkeys () {
        this.window.lock = false;

        globalShortcut.unregister("Alt+A");
        globalShortcut.register("Alt+K", () => common.windows.send(this.window, "turnViewersList"));
    }

    registerMenuHotkeys () {
        this.window.lock = true;

        globalShortcut.unregister("Alt+K");
        globalShortcut.register("Alt+A", () => {
            this.window.lock = !this.window.lock;
            this.window.setIgnoreMouseEvents(!this.window.lock);
            common.windows.send(this.window, "turnLock", this.window.lock);
        });
    }
}

export default Hotkeys;