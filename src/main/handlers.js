import { ipcMain, screen } from "electron";

import hotkeys from "./hotkeys";
import common from "./common";

export default {
    register: window => {
        ipcMain.handleOnce("config", () => {
            common.storage.config.display = screen.getPrimaryDisplay().size;
            return common.storage.config;
        });

        ipcMain.on("turnMouse", (_event, enabled) => {
            if (window) {
                window.setIgnoreMouseEvents(!enabled);
                enabled ? hotkeys.registerMenuHotkeys(window) : hotkeys.registerIndexHotkeys(window);
            }
        });

        ipcMain.on("saveSettings", (_, args) => common.storage.save(args.type, args.content));

        ipcMain.on("devTools", (_event, sequence) =>
            sequence ? window.openDevTools({ mode: "undocked" }) : window.closeDevTools()
        );
    }
};