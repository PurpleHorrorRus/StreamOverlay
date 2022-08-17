import { app, dialog, ipcMain, screen } from "electron";

import common from "./common";

class Handlers {
    constructor (mainWindowInstance) {
        this.mainWindowInstance = mainWindowInstance;
    }

    main() {
        const config = () => {
            common.storage.config.display = screen.getPrimaryDisplay().size;
            return common.storage.config;
        };

        common.isDev 
            ? ipcMain.handle("config", config) 
            : ipcMain.handleOnce("config", config);

        ipcMain.on("turnMouse", (_event, enabled) => {
            this.mainWindowInstance.window.setIgnoreMouseEvents(!enabled);

            enabled
                ? this.mainWindowInstance.hotkeys.registerMenuHotkeys()
                : this.mainWindowInstance.hotkeys.registerIndexHotkeys();
        });
    }

    create() {
        ipcMain.on("saveSettings", (_, args) => {
            common.storage.save(args.type, args.content);
        });

        ipcMain.on("devTools", (_event, sequence) => {
            sequence 
                ? this.mainWindowInstance.window.webContents.openDevTools({ mode: "undocked" }) 
                : this.mainWindowInstance.window.webContents.closeDevTools();
        });

        ipcMain.once("restart", () => {
            app.relaunch();
            app.exit(0);
        });

        ipcMain.handle("FindWindow", (_, window) => {
            return this.mainWindowInstance.addon.FindWindow(window);
        });

        ipcMain.handle("select", async (_, options) => {
            const { canceled, filePaths } = await dialog.showOpenDialog(options);
            return !canceled ? filePaths : false;
        });
    }
}

export default Handlers;