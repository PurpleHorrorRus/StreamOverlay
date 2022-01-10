/* eslint-disable constructor-super */
import addon from "overlayaddon";
import path from "path";

import common from "./common";

class Addon {
    constructor (window) {
        this.window = window;

        // eslint-disable-next-line no-undef
        addon.InitWindow(this.window.getNativeWindowHandle(), path.basename(process.execPath));
        addon.SetLowPriority();
        addon.ReduceWorkingSet();
    }

    clearMemory () {
        addon.SetLowPriority();

        if (common.storage.config.settings.RAMClean) {
            addon.ReduceWorkingSet();
        }

        return {
            interval: timeout => setInterval(() => this.clearMemory(), timeout)
        };
    }

    moveTop () {
        if (!this.window.menu) {
            addon.MoveTop();
            this.window.showInactive();
        }

        return {
            interval: timeout => setInterval(() => this.moveTop(), timeout)
        };
    }

    FindWindow (name) {
        return addon.FindWindow(name);
    }

    GetNames () {
        return addon.GetNames();
    }
}

export default Addon;