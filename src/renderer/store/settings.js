import { ipcRenderer } from "electron";

export default {
    namespaced: true,

    state: () => ({
        settings: {}
    }),

    actions: {
        SET: ({ state }, settings) => {
            state.settings = settings;
            return settings;
        },

        SAVE: ({ state }, settings) => {
            state.settings = settings || state.settings;

            ipcRenderer.send("saveSettings", {
                type: "settings",
                content: settings
            });

            return settings;
        },

        SAVE_CUSTOM: async ({ dispatch, rootState }, { type, settings }) => {
            if (type === "settings") {
                return await dispatch("SAVE", settings);
            }

            rootState.config[type] = settings;

            ipcRenderer.send("saveSettings", {
                type,
                content: settings
            });

            return settings;
        }
    }
};