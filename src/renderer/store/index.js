import Vuex from "vuex";

import obs from "~/store/obs";
import websocketInstaller from "~/store/websocket/install";

import twitch from "~/store/services/twitch";
import trovo from "~/store/services/trovo";

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
            websocketInstaller,

            twitch, 
            trovo,

            widgets, 
            notifications, 
            settings,  
            ipc
        } 
    });
};

export default store;