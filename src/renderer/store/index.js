import Vuex from "vuex";
import fs from "fs-extra";
import path from "path";

import obs from "~/store/obs";
import strings from "./i18n";

import service from "~/store/services/service";
import twitch from "~/store/services/twitch";
import trovo from "~/store/services/trovo";

import widgets from "~/store/widgets";
import notifications from "~/store/notifications";
import settings from "~/store/settings";
import ipc from "~/store/ipc";
import discord from "~/store/discord";

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
            },

            SERVICE_DISPATCH: async ({ dispatch, state }, request) => {
                const action = request.action || request;
                const data = request.data || null;
                const service = state.settings.settings.service;
                return await dispatch(`${service}/${action}`, data);
            },

            PREPARE_TEMP_FOLDER: ({ state }, folderPath) => {
                if (!fs.existsSync(state.config.paths.temp)) {
                    fs.mkdirSync(state.config.paths.temp);
                }
                
                const folder = path.join(state.config.paths.temp, folderPath);
                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder);
                }

                return path.resolve(folder);
            }
        },
        
        modules: {
            strings,
            obs,

            service,
            twitch, 
            trovo,

            widgets, 
            notifications, 
            settings,  
            ipc,
            discord
        } 
    });
}