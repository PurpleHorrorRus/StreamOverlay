import { ipcRenderer } from "electron";

export default {
    namespaced: true,
    state: () => ({
        settings: null
    }),
    actions: {
        SET: ({ state }, settings) => state.settings = settings,
        SAVE: ({ state, dispatch, rootState }, settings) => {
            if (!settings.type) {
                return console.error("You must to specify settings type", settings);
            }

            if (settings.type === "settings") {
                state.settings = settings.content;
            }

            const config = rootState.config;
            config[settings.type] = settings.content;

            dispatch("SET_CONFIG", config, { root: true });
            ipcRenderer.send("saveSettings", settings);
        }
    }
};