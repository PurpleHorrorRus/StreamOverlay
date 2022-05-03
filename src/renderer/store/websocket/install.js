import { ipcRenderer } from "electron";

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import fetchProgress from "node-fetch-progress";
import AdmZip from "adm-zip";

const exeName = "obs64.exe";

// eslint-disable-next-line max-len
const OBSWebsocketURL = "https://github.com/obsproject/obs-websocket/releases/download/4.9.1/obs-websocket-4.9.1-Windows.zip";

const validEntries = [
    "bin/64bit/",
    "data/",
    "obs-plugins/64bit/"
];

const errors = {
    INVALID_PATH: "Неверно указан путь до папки OBS Studio",
    OBS_IS_OPEN: "Перед началом работы закройте OBS Studio"
};

export default {
    namespaced: true,

    state: () => ({
        active: false,
        error: "",
        progress: 0
    }),

    actions: {
        INSTALL: async ({ dispatch, state }, target) => {
            const pathIsValid = await dispatch("VALIDATE_PATH", target);
            const OBSOpened = await dispatch("VALIDATE_CLOSED_OBS");

            if (!pathIsValid) {
                dispatch("RESET");
                state.error = errors.INVALID_PATH;
                return false;
            }

            if (OBSOpened) {
                dispatch("RESET");
                state.error = errors.OBS_IS_OPEN;
                return false;
            }
            
            state.active = true;
            state.progress = 0;
                
            const zipFile = await dispatch("DOWNLOAD");
            await dispatch("EXTRACT", { zipFile, target }).catch(e => {
                state.error = e;
                dispatch("RESET");
                throw e;
            });

            return await dispatch("RESET");
        },

        DOWNLOAD: async ({ state }) => {
            const zipFile = path.resolve("websocket.zip");
            const stream = fs.createWriteStream(zipFile);

            const request = await fetch(OBSWebsocketURL);
            const progress = new fetchProgress(request);

            progress.on("progress", p => {
                state.progress = Math.floor(p.progress * 100);
            });

            request.body.pipe(stream);

            return await new Promise(resolve => {
                stream.once("finish", () => resolve(zipFile));
            });
        },

        EXTRACT: async (_, { zipFile, target }) => {
            const zip = new AdmZip(zipFile);
            const entries = zip.getEntries();
            const valid = entries.filter(entry => {
                return ~validEntries.indexOf(entry.entryName);
            });

            for (const entry of valid) {
                zip.extractEntryTo(entry.entryName, target, true, true);
            }
            
            return true;
        },

        RESET: ({ state }) => {
            state.active = false;
            state.progress = 0;
            return true;
        },

        VALIDATE_CLOSED_OBS: async () => {
            return await ipcRenderer.invoke("FindWindow", exeName);
        },

        VALIDATE_PATH: (_, folder) => {
            const exeFile = path.resolve(folder, "bin", "64bit", exeName);
            return fs.existsSync(exeFile);
        }
    }
};