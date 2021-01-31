import { ipcRenderer } from "electron";

export default {
    namespaced: true,
    state: () => ({
        settings: null
    }),
    mutations: {
        setSettings: (state, settings) => state.settings = settings
    },
    actions: {
        setSettings: ({ commit }, settings) => commit("setSettings", settings),
        saveSettings: ({ commit, dispatch, rootState }, settings) => {
            if (!settings.type) {
                return console.error("You must to specify settings type", settings);
            }

            if (settings.type === "settings") {
                commit("setSettings", settings.content);
            }

            const config = rootState.config;
            config[settings.type] = settings.content;

            dispatch("SET_CONFIG", config, { root: true });
            
            ipcRenderer.send("saveSettings", {
                type: settings.type,
                content: settings.content
            });
        }
    }
};