import Vuex from "vuex";

import followers from "~/store/followers";
import obs from "~/store/obs";
import twitch from "~/store/twitch";
import widgets from "~/store/widgets";
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
        modules: { 
            followers,
            obs, 
            twitch, 
            widgets, 
            notifications, 
            settings,  
            ipc
        } 
    });
};

export default store;