import Helix from "simple-helix-api";
import tmi from "tmi.js";
import lodash from "lodash";

import formatter from "~/store/services/formatter";
import events from "~/store/services/twitch/events";
import emotes from "~/store/services/twitch/emotes";
import badges from "~/store/services/twitch/badges";

// botID = 169440375;

const profilesCacheMax = 50;
let profilesCacheSize = 0;
let profilesCache = {};

export default {
    namespaced: true,

    state: () => ({
        credits: {},
        tags: null
    }),

    mutations: {
        LOGIN_REDIRECT() {
            this.$router.replace("/services/twitch").catch(() => {});
            return true;
        }
    },

    actions: {
        AUTH: async ({ dispatch, rootState }) => {
            if (rootState.service.client) {
                return false;
            }

            // eslint-disable-next-line no-undef
            if (!process.env.twitch_client_id) {
                console.warn("[Trovo] There is no secrets for Twitch client");
                return false;
            }

            const config = rootState.config.twitch;
            if (!config.username || !config.access_token || !config.oauth_token) {
                return await dispatch("LOGIN_ERROR");
            }
            
            const response = await dispatch("INIT", config).catch(async () => {
                return await dispatch("LOGIN_ERROR");
            });

            return Boolean(response);
        },

        INIT: async ({ dispatch }, credits) => {
            const client = await dispatch("service/SET_CLIENT", new Helix({
                // eslint-disable-next-line no-undef
                client_id: process.env.twitch_client_id,
                access_token: credits.access_token,
                language: "ru"
            }), { root: true });
            
            let user = await client.users.getByLogin(credits.username);
            user = await dispatch("service/SET_USER", {
                ...user,
                id: Number(user.id),
                nickname: user.display_name,
                avatar: user.profile_image_url
            }, { root: true });
            dispatch("CACHE_PROFILE", user.nickname);
            
            const channel = await client.channel.get(user.id);
            await dispatch("service/SET_STREAM", {
                title: channel.title,
                game: channel.game_name
            }, { root: true });

            dispatch("CONNECT", credits);
            dispatch("badges/LOAD", user.id);
            dispatch("emotes/LOAD", {
                id: user.id,
                name: user.nickname
            });

            return client;
        },

        LOGIN_ERROR: ({ commit, rootState }) => {
            rootState.settings.settings.first = true;
            commit("LOGIN_REDIRECT");
            return false;
        },

        CONNECT: async ({ dispatch, rootState, state }, credits) => {
            const chat = await dispatch("service/SET_CHAT", new tmi.Client({
                connection: { reconnect: true },
                identity: {
                    username: credits.username,
                    password: credits.oauth_token
                },
                channels: [credits.username]
            }), { root: true });

            chat.on("message", async (_, user, message) => {
                if (!rootState.settings.settings.chat.enable) {
                    return;
                }

                const profile = await dispatch("GET_PROFILE", user["display-name"]);
                
                if (user.color === "#000000") {
                    user.color = "#FFFFFF";
                }

                message = message.trim();
                
                await dispatch("service/ADD_MESSAGE", {
                    nickname: profile.display_name,
                    avatar: profile.profile_image_url,
                    content: message,
                    badges: await dispatch("badges/FORMAT", user.badges),
                    formatted: await dispatch("FORMAT_MESSAGE", { text: message, emotes: user.emotes }),
                    time: await dispatch("service/GET_CURRENT_TIME", null, { root: true }),
                    color: user.color,
                    type: user["msg-id"] || 0
                }, { root: true });
            });

            chat.on("raw_message", (_, message) => {
                if (message.command === "ROOMSTATE" && !state.tags) {
                    state.tags = message.tags;
                    return dispatch("events/ON_RAW_MESSAGE_FOLLOWERS_MODE");
                }
            });

            chat.on("followersonly", (_, enabled) => {
                state.tags["followers-only"] = enabled ? "0" : "-1";
                
                // eslint-disable-next-line max-len
                return dispatch("service/ADD_SYSTEM_MESSAGE", `Режим "только для фолловеров" ${enabled ? "включен" : "выключен"}`, {
                    root: true
                });
            });

            chat.on("connected", () => {
                chat.raw("CAP REQ :twitch.tv/tags");
                rootState.service.connected = true;
                return dispatch("events/ON_CONNECTED");
            });

            chat.on("disconnected", () => {
                dispatch("DISCONNECT");
                return dispatch("events/ON_DISCONNECTED");
            });

            chat.on("ban", (_, username) => {
                for (const message of rootState.twitch.messages) {
                    if (username === message.nickname) {
                        message.banned = true;
                    }
                }

                return dispatch("events/ON_BAN", username);
            });

            chat.on("clearchat", () => {
                return dispatch("events/ON_CLEAR_CHAT");
            });

            chat.on("raided", (_, username, viewers) => {
                return dispatch("events/ON_RAID", { username, viewers });
            });
            
            chat.connect();

            return chat;
        },

        DISCONNECT: ({ state, rootState }) => {
            rootState.service.connected = false;
            state.tags = null;
        },

        CACHE_PROFILE: async ({ rootState }, username) => {
            profilesCache[username] = await rootState.service.client.users.getByLogin(username);

            if (profilesCacheSize > profilesCacheMax - 1) {
                const spliceLen = Object.values(profilesCache).length - profilesCacheMax;
                const entries = Object.entries(profilesCache);
                const profilesArray = Object.fromEntries(entries);
                profilesCache = profilesArray.splice(spliceLen);
            } else {
                profilesCacheSize++;
            }

            return profilesCache[username];
        },

        GET_PROFILE: async ({ dispatch }, username) => {
            return profilesCache[username] || await dispatch("CACHE_PROFILE", username);
        },

        FORMAT_MESSAGE: async ({ dispatch }, message) => {
            let formatted = [];
            let part = "";

            const twitchEmotes = await dispatch("emotes/FORMAT_TWITCH_EMOTES", message);

            const splitted = message.text.split(" ");
            for (let wordIndex in splitted) {
                wordIndex = Number(wordIndex);
                const word = splitted[wordIndex];

                if (await dispatch("formatter/CHECK_LINK", word)) { // Format link
                    formatted = await dispatch("formatter/LINK", { formatted, part, word });
                    part = "";
                    continue;
                }

                const emote = twitchEmotes.find(e => e.code === word) 
                    || await dispatch("emotes/FIND", word);

                if (emote) {
                    formatted = await dispatch("formatter/EMOTE", { 
                        formatted, part, 
                        emote: await dispatch("FORMAT_EMOTE", emote)
                    });

                    part = "";
                } else part += " " + word;
            }

            return await dispatch("formatter/TEXT", { formatted, part });
        },

        BAN: async ({ rootState }, data) => {
            data.nickname = data.nickname.toLowerCase();
            const username = rootState.service.user.nickname.toLowerCase();

            data.duration
                ? rootState.service.chat.timeout(username, data.nickname, data.duration, data.reason)
                : rootState.service.chat.ban(username, data.nickname, data.reason);
        },
        
        UPDATE: async ({ dispatch, rootState }, data) => {
            if (!data.title) data.title = rootState.service.stream.title;
            if (!data.game) data.game = rootState.service.stream.game;
            
            await rootState.service.client.updateStream(rootState.service.user.id, data.title, data.game);
            await dispatch("service/SET_STREAM", data, { root: true });
            await dispatch("service/UPDATE_RECENT", data, { root: true });

            return true;
        },

        GET_STREAM: async ({ rootState }) => {
            const channel = await rootState.service.client.channel.get(rootState.service.user.id);
            return {
                title: channel.title,
                game: channel.game_name
            };
        },

        VIEWERS_COUNT: async ({ rootState }) => {
            const stream = await rootState.service.client.stream.streams({ 
                user_id: rootState.service.user.id 
            });

            return Number(stream?.viewer_count) || 0;
        },

        FOLLOWERS_COUNT: async ({ rootState }) => {
            const follows = await rootState.service.client.users.follows(rootState.service.user.id);
            return Number(follows?.total) || 0;
        },

        CHATTERS: async ({ rootState }) => {
            const botsRequest = await fetch("https://api.twitchinsights.net/v1/bots/online");
            const { bots } = botsRequest.ok ? await botsRequest.json() : { bots: [] };
            const { chatters } = await rootState.service.client.other.getViewers(rootState.service.user.nickname);

            if (!bots || !chatters) {
                return [];
            }

            const botNames = bots.map(bot => bot[0]);
            for (const category in chatters) {
                chatters[category] = lodash.difference(chatters[category], botNames);
            }

            return lodash.pickBy(chatters, category => {
                return category.length > 0;
            });
        },
        
        SAY: ({ rootState }, message) => {
            if (!rootState.service.connected) return false;
            rootState.service.chat.say(rootState.service.user.nickname, message);
        },

        TURN_FOLLOWERS_ONLY: ({ rootState, state }, duration = 0) => {
            if (rootState.service.connected) {
                const user_id = rootState.service.user.id;
                rootState.service.client.chat.updateSettings(user_id, user_id, {
                    follower_mode: state.tags["followers-only"] === "-1",
                    follower_mode_duration: duration
                });
            }
        },

        SEARCH_GAME: async ({ rootState }, query) => {
            const games = await rootState.service.client.search.categories(query);
            return games.data || Array.isArray(games) ? games : [games];
        },

        FORMAT_EMOTE: (_, emote) => {
            return {
                name: emote.code,
                url: emote.url
            };
        },

        FORMAT_GAME: (_, game) => {
            return {
                name: game.name,
                icon: game.box_art_url
            };
        }
    },
    modules: {
        formatter,
        events,
        emotes,
        badges
    }
};