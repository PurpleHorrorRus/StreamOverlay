import { ipcRenderer } from "electron";

export default {
    namespaced: true,
    state: () => ({
        settings: null,
        OBS: null,
        twitch: null,
        overlays: null
    }),
    mutations: {
        setSettings (state, settings) {
            state.settings = settings;
        }
    },
    actions: {
        setSettings ({ commit }, settings) {
            commit("setSettings", settings);
        },
        saveSettings ({ commit }, settings) { 
            if (!settings.type) {
                return console.error("You must to specify settings type", settings);
            }

            if (settings.type === "settings") {
                commit("setSettings", settings.content);
            }
            
            ipcRenderer.send("saveSettings", {
                type: settings.type,
                content: settings.content
            });
        }
    },
    getters: {
        getSettings (state) { 
            return state.settings; 
        }
    }
};