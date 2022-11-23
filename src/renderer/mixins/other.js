import { shell } from "electron";

export default {
    methods: {
        openLink (url) {
            shell.openExternal(url);
        }
    }
};