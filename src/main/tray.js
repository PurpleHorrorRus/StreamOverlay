import { app, Tray, Menu } from "electron";
import { default as common } from "./common";

let tray = null;

export default {
    create: () => {
        tray = new Tray(common.icon);
        tray.setToolTip("Stream Overlay");
        tray.setContextMenu(
            Menu.buildFromTemplate([
                { label: "Выход", type: "normal", click: app.exit }
            ])
        );
    }
};