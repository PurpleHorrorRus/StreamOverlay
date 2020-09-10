import { shell } from "electron";
import fs from "fs";
import socket from "obs-websocket-js";

export default {
    methods: {
        checkConnection() {
            return new Promise(resolve => {
                const obs = new socket();
                obs.connect({ address: `${this.address}:${this.port}`, password: this.password })
                    .then(() => resolve({ success: true }))
                    .catch(() => resolve({ success: false }));
            });
        },
        readJSON(dir) {
            const content = fs.readFileSync(dir, "UTF-8");
            return JSON.parse(content);
        },
        writeJSON(dir, json) {
            const content = JSON.stringify(json, null, 4);
            fs.writeFileSync(dir, content);
        },
        openLink(url) { 
            shell.openExternal(url); 
        }
    }
};