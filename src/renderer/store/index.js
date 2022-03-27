import Vuex from "vuex";

import obs from "~/store/obs";
import websocketInstaller from "~/store/websocket/install";

import service from "~/store/services/service";
import twitch from "~/store/services/twitch";
import trovo from "~/store/services/trovo";

import widgets from "~/store/widgets";
import notifications from "~/store/notifications";
import settings from "~/store/settings";
import ipc from "~/store/ipc";

export default function() {
    return new Vuex.Store({
        state: () => ({
            config: null
        }),

        actions: {
            SET_CONFIG: ({ dispatch, state }, config) => {
                state.config = config;
                
                if (config?.settings) {
                    dispatch("settings/SET", config.settings, { root: true });
                }
            }
        },
        
        modules: {
            obs,
            websocketInstaller,

            service,
            twitch, 
            trovo,

            widgets, 
            notifications, 
            settings,  
            ipc
        } 
    });
}