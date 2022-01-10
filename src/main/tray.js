import { Tray, Menu } from "electron";

import common from "./common";

class OverlayTray extends Tray {
    constructor (windowInstance) {
        super(common.icon);
        this.setToolTip("Stream Overlay");
        this.setContextMenu(Menu.buildFromTemplate([{ 
            label: "Выход", 
            type: "normal", 
            click: () => windowInstance.close()
        }]));
    }
}

export default OverlayTray;