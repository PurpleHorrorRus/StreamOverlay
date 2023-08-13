import { globalShortcut } from "electron";

import common from "./common";

class Hotkeys {
	constructor (window) {
		this.window = window;
	}

	register () {
		this.window.menu = false;
		this.window.lock = false;

		const turnMenu = () => {
			return common.windows.send(this.window, "turnMenu", !this.window.menu);
		};

		globalShortcut.register("Alt+R", turnMenu);
		globalShortcut.register("Alt+T", turnMenu);
	}

	registerIndexHotkeys () {
		this.window.menu = false;
		this.window.lock = false;
		this.window.setIgnoreMouseEvents(true);

		globalShortcut.unregister("Alt+A");
		globalShortcut.register("Alt+K", () => common.windows.send(this.window, "turnViewersList"));
	}

	registerMenuHotkeys () {
		this.window.menu = true;
		this.window.lock = true;
		this.window.setIgnoreMouseEvents(false);

		globalShortcut.unregister("Alt+K");
		globalShortcut.register("Alt+A", () => {
			this.window.lock = !this.window.lock;
			this.window.setIgnoreMouseEvents(!this.window.lock);
			common.windows.send(this.window, "turnLock", this.window.lock);
		});
	}
}

export default Hotkeys;