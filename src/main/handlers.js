import { app, dialog, ipcMain, screen } from "electron";

import common from "./common";

class Handlers {
	constructor (mainWindowInstance) {
		const config = () => {
			common.storage.config.display = screen.getPrimaryDisplay().size;
			return common.storage.config;
		};

		common.isDev
			? ipcMain.handle("config", config)
			: ipcMain.handleOnce("config", config);

		common.isDev
			? ipcMain.handle("paths", () => (common.storage.paths))
			: ipcMain.handleOnce("paths", () => (common.storage.paths));

		ipcMain.on("turnMouse", (_event, enabled) => {
			mainWindowInstance.window.setIgnoreMouseEvents(!enabled);
			enabled
				? mainWindowInstance.hotkeys.registerMenuHotkeys()
				: mainWindowInstance.hotkeys.registerIndexHotkeys();
		});

		ipcMain.on("saveSettings", (_, args) => {
			common.storage.save(args.type, args.content);
		});

		ipcMain.on("devTools", (_event, sequence) => {
			sequence
				? mainWindowInstance.window.webContents.openDevTools({ mode: "undocked" })
				: mainWindowInstance.window.webContents.closeDevTools();
		});

		ipcMain.handle("FindWindow", (_, window) => {
			return mainWindowInstance.addon.FindWindow(window);
		});

		ipcMain.handle("GetNames", () => {
			return mainWindowInstance.addon.GetNames();
		});

		ipcMain.handle("select", async (_, options) => {
			const { canceled, filePaths } = await dialog.showOpenDialog(options);
			return !canceled ? filePaths : false;
		});
	}
}

export default Handlers;