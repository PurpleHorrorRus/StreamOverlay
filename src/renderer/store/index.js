import Vuex from "vuex";
import fs from "fs-extra";
import path from "path";

import strings from "./i18n";

import obs from "./obs";

import service from "./services/service";
import twitch from "./services/twitch";
import trovo from "./services/trovo";

import followers from "./followers";

import widgets from "./widgets";
import notifications from "./notifications";
import ipc from "./ipc";
import discord from "./discord";

export default function() {
    return new Vuex.Store({
        state: () => ({
            config: null
        }),

        actions: {
            SET_CONFIG: ({ state }, config) => {
                const save = (type, content) => {
                    state.config[type] = content || state.config[type];

                    global.$nuxt.$ipc.send("saveSettings", {
                        type,
                        content: state.config[type]
                    });

                    return state.config[type];
                };

                for (const key of Object.keys(config)) {
                    if (!Array.isArray(config[key])) {
                        config[key].save = content => save(key, content);
                    }
                }

                state.config = config;
                state.config.save = save;

                return state.config;
            },

            SERVICE_DISPATCH: async ({ dispatch, state }, request) => {
                const action = request.action || request;
                const data = request.data || null;
                const service = state.config.settings.service;
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

            followers,

            widgets,
            notifications,
            ipc,
            discord
        }
    });
}