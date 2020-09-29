import Vuex from "vuex";

import obs from "~/store/obs";
import twitch from "~/store/twitch";
import overlays from "~/store/overlays";
import notifications from "~/store/notifications";
import settings from "~/store/settings";
import ipc from "~/store/ipc";

const store = () => {
    return new Vuex.Store({
        state: () => ({
            config: {}
        }),
        mutations: {
            SET_CONFIG: (state, config) => state.config = config
        },
        actions: {
            SET_CONFIG ({ commit }, config) {
                commit("SET_CONFIG", config);
            }
        },
        getters: {
            GET_CONFIG: state => state.config
        },
        modules: { 
            obs, 
            twitch, 
            overlays, 
            notifications, 
            settings,  
            ipc
        } 
    });
};

export default store;