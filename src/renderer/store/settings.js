import { ipcRenderer } from "electron";

export default {
    namespaced: true,
    
    state: () => ({
        settings: null
    }),

    actions: {
        SET: ({ state }, settings) => {
            state.settings = settings;
            return settings;
        },

        SAVE: async ({ dispatch, rootState }, settings) => {
            if (!settings.type) {
                return console.error("You must to specify settings type", settings);
            }

            if (settings.type !== "settings") {
                rootState.config[settings.type] = settings.content;
            }

            ipcRenderer.send("saveSettings", settings);
            return await dispatch("SET_CONFIG", rootState.config, { root: true });
        }
    }
};