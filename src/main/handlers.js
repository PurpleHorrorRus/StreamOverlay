import { ipcMain, screen } from "electron";

import common from "./common";

class Handlers {
    constructor (mainWindowInstance, hotkeysInstance) {
        const config = () => {
            common.storage.config.display = screen.getPrimaryDisplay().size;
            return common.storage.config;
        };

        common.isDev ? ipcMain.handle("config", config) : ipcMain.handleOnce("config", config);

        ipcMain.on("turnMouse", (_event, enabled) => {
            mainWindowInstance.window.setIgnoreMouseEvents(!enabled);
            enabled ? hotkeysInstance.registerMenuHotkeys() : hotkeysInstance.registerIndexHotkeys();
        });
        
        ipcMain.on("saveSettings", (_, args) => common.storage.save(args.type, args.content));

        ipcMain.on("devTools", (_event, sequence) => {
            sequence 
                ? mainWindowInstance.window.webContents.openDevTools({ mode: "undocked" }) 
                : mainWindowInstance.window.webContents.closeDevTools();
        });
    }
}

export default Handlers;