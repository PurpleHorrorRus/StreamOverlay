import { app, dialog, ipcMain, screen } from "electron";

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
        
        ipcMain.on("saveSettings", (_, args) => {
            common.storage.save(args.type, args.content);
        });

        ipcMain.on("devTools", (_event, sequence) => {
            sequence 
                ? mainWindowInstance.window.webContents.openDevTools({ mode: "undocked" }) 
                : mainWindowInstance.window.webContents.closeDevTools();
        });

        ipcMain.once("restart", () => {
            app.relaunch();
            app.exit(0);
        });

        ipcMain.handle("FindWindow", (_, window) => mainWindowInstance.addonInstance.FindWindow(window));
        ipcMain.handle("select", async (_, options) => {
            const { canceled, filePaths } = await dialog.showOpenDialog(options);
            return !canceled ? filePaths : false;
        });
    }
}

export default Handlers;