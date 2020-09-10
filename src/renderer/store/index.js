import Vuex from "vuex";

import obs from "~/store/obs";
import twitch from "~/store/twitch";
import overlays from "~/store/overlays";
import notifications from "~/store/notifications";
import settings from "~/store/settings";
import ipc from "~/store/ipc";

const store = () => {
    return new Vuex.Store({
        state: () => ({}),
        mutations: {},
        actions: {},
        getters: {},
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