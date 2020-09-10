import Vuex from "vuex";
import strings from "~/store/strings";
import obs from "~/store/obs";
import twitch from "~/store/twitch";
import database from "~/store/database";
import users from "~/store/users";
import autoprocess from "~/store/autoprocess";
import overlays from "~/store/overlays";
import meridius from "~/store/meridius";
import donatepay from "~/store/donatepay";
import notifications from "~/store/notifications";
import discord from "~/store/discord";
import settings from "~/store/settings";
import vk from "~/store/vk";
import ipc from "~/store/ipc";
import timers from "~/store/timers";

const store = () => {
    return new Vuex.Store({
        state: () => ({}),
        mutations: {},
        actions: {},
        getters: {},
        modules: { 
            strings, 
            obs, 
            twitch, 
            database, 
            users, 
            autoprocess, 
            overlays, 
            meridius, 
            donatepay, 
            notifications, 
            discord, 
            settings, 
            vk, 
            ipc, 
            timers 
        } 
    });
};

export default store;