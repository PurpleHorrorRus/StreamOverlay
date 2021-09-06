import Vuex from "vuex";

import obs from "~/store/obs";
import twitch from "~/store/twitch";
import widgets from "~/store/widgets";
import notifications from "~/store/notifications";
import settings from "~/store/settings";
import ipc from "~/store/ipc";

const store = () => {
    return new Vuex.Store({
        state: () => ({
            config: null
        }),
        actions: {
            SET_CONFIG: ({ dispatch, state }, config) => {
                state.config = config;
                dispatch("settings/SET", config.settings, { root: true });
            }
        },
        modules: {
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