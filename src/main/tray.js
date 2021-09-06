import { Tray, Menu } from "electron";

import common from "./common";

let tray = null;

export default {
    create: mainWindow => {
        tray = new Tray(common.icon);
        tray.setToolTip("Stream Overlay");
        tray.setContextMenu(Menu.buildFromTemplate([{ label: "Выход", type: "normal", click: mainWindow.close }]));
    }
};