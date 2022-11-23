/* eslint-disable no-undef */
import { ipcMain } from "electron";

const isDev = process.env.NODE_ENV === "development";
class WindowLogic {
    isWindowAlive(window) {
        return window && !window.isDestroyed();
    }

    load(window) {
        return new Promise(resolve => {
            ipcMain.once("dom-ready", () => {
                return resolve(this.isWindowAlive(window));
            });

            const url = isDev
                ? process.env.DEV_SERVER_URL
                : "overlay://./index.html";

            window.loadURL(url);
        });
    }

    send(window, event, content = {}) {
        if (!this.isWindowAlive(window)) {
            return false;
        }

        window.webContents.send(event, content);
        return true;
    }
}

export default WindowLogic;