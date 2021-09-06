import addon from "overlayaddon";
import path from "path";

import common from "./common";

const clearMemory = () => {
    addon.SetLowPriority();

    if (common.storage.config.settings.RAMClean) {
        addon.ReduceWorkingSet();
    }
};

const moveTop = window => {
    if (window && !window.menu) {
        addon.MoveTop();
        window.showInactive();
    }
};

const init = window => {
    // eslint-disable-next-line no-undef
    addon.InitWindow(window.getNativeWindowHandle(), path.basename(process.execPath));
    addon.SetLowPriority();
    addon.ReduceWorkingSet();

    return {
        clearMemory: () => {
            clearMemory();
            return {
                interval: timeout => setInterval(clearMemory, timeout)
            };
        },
        moveTop: () => {
            moveTop(window);
            return {
                interval: timeout => setInterval(() => moveTop(window), timeout)
            };
        }
    };
};

export default { init, ...addon };