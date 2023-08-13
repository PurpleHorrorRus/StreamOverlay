import { app } from "electron";
import path from "path";
import fs from "fs-extra";

const isDev = process.env.NODE_ENV === "development";

const clear = {
	settings: {
		first: true,
		contentProtection: true,
		restriction: true,
		RAMClean: false,
		devtools: false,
		hardwareAcceleration: true,
		discord: false,
		outputDeviceId: "default",
		service: "none",

		chat: {
			enable: true,
			avatar: true,
			badges: true,
			timeout: 80,
			opacity: 30,
			font: 12,
			x: 0,
			y: 0,
			width: 143,
			height: 160,
			sound: false,

			tts: {
				enable: false,
				readName: false
			}
		},

		OBSStatus: {
			enable: true,
			time: true,
			tech: false,
			x: -37,
			y: 1022,

			mini: {
				enable: false,
				opacity: 80,
				radius: 8,
				scale: 1,
				border: true,
				shadow: true
			},

			ServiceInfo: {
				enable: true,
				followers: true
			}
		},

		ViewersList: {
			enable: false,
			x: 1721,
			y: 801,
			width: 192,
			height: 219
		},

		notifications: {
			lowfps: true,
			lowbitrate: true
		},

		trovo: {
			past: false,

			notifications: {
				welcome: true
			}
		}
	},

	obs: {
		address: "127.0.0.1",
		port: 4455,
		password: "",
		camera: [],
		autoreconnect: false,

		meters: {
			mic: {
				enable: true,
				limit: -60,
				timeout: 300
			}
		}
	},

	twitch: {
		username: "",
		access_token: "",
		version: 2,
		eventsubDebug: false,
		chatDebug: false,
		chatSecure: true,

		notifications: {
			"channel.update": true,
			"channel.follow": true,
			"channel.subscribe": true,
			"channel.ban": true,
			"stream.online": true
		}
	},

	trovo: {
		access_token: "",
		refresh_token: ""
	},

	widgets: [],
	recent: []
};

class Storage {
	constructor () {
		this.appdata = app.getPath("userData");

		this.root = isDev
			? path.resolve(this.appdata, "config", "StreamOverlay")
			: path.resolve(this.appdata, "config");

		this.paths = {
			root: this.root,
			temp: path.resolve(app.getPath("temp"), "streamoverlay")
		};

		this.config = {};
	}

	checkDirs (dirs) {
		for (const dir of dirs) {
			if (!fs.pathExistsSync(dir)) {
				fs.mkdirsSync(dir);
			}
		}

		return dirs;
	}

	merge (settings, clear) {
		if (!clear) {
			return settings;
		}

		for (const key of Object.keys(clear)) {
			const settingType = typeof settings[key];
			const differentTypes = settingType !== typeof clear[key];
			const isNewKey = !(key in settings) && key in clear || differentTypes;
			const settingIsArray = Array.isArray(settings[key]);

			if (isNewKey) {
				settings[key] = clear[key];
			} else if (settingType === "object" && !settingIsArray) {
				settings[key] = this.merge(settings[key], clear[key]);
			}
		}

		for (const key of Object.keys(settings)) {
			if (key in settings && !(key in clear)) {
				delete settings[key];
			}
		}

		return settings;
	}

	nested (name, skip = false) {
		const path = this.paths[name];
		const clearConfig = clear[name];

		if (fs.existsSync(path)) {
			const content = fs.readJsonSync(path);
			return !skip ? this.merge(content, clearConfig) : content;
		}

		fs.writeJsonSync(path, clearConfig, { spaces: 4 });
		return clearConfig;
	}

	create () {
		this.checkDirs(Object.values(this.paths));

		for (const key of Object.keys(clear)) {
			this.paths[key] = path.resolve(this.root, `${key}.json`);
		}

		this.config = {
			settings: this.nested("settings"),
			obs: this.nested("obs"),
			twitch: this.nested("twitch"),
			trovo: this.nested("trovo"),
			widgets: this.nested("widgets", true),
			recent: this.nested("recent", true)
		};

		return this;
	}

	save (type, content) {
		delete content.save;

		this.config[type] = content;
		return fs.writeJsonSync(this.paths[type], content, { spaces: 4 });
	}

	clear (type) {
		this.config[type] = clear[type];
		return fs.writeJsonSync(this.paths[type], this.config[type], { spaces: 4 });
	}
}

export default Storage;