import { shell } from "electron";
import socket from "obs-websocket-js";

export default {
    methods: {
        checkConnection () {
            return new Promise(resolve => {
                const obs = new socket();
                obs.connect({ address: `${this.address}:${this.port}`, password: this.password })
                    .then(() => resolve({ success: true }))
                    .catch(() => resolve({ success: false }));
            });
        },
        openLink (url) { 
            shell.openExternal(url); 
        }
    }
};