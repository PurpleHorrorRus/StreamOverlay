import Helix from "simple-helix-api";
import axios from "axios";
import lodash from "lodash";
import Promise from "bluebird";

import formatter from "~/store/services/formatter";

import eventsub from "~/store/services/twitch/eventsub";
import events from "~/store/services/twitch/events";
import emotes from "~/store/services/twitch/emotes";
import badges from "~/store/services/twitch/badges";

import misc from "~/plugins/misc";

const profilesCacheMax = 50;
let profilesCacheSize = 0;
let profilesCache = {};

export default {
    namespaced: true,

    state: () => ({
        tags: null,
        version: 2
    }),

    mutations: {
        LOGIN_REDIRECT(_state, query) {
            if (query) {
                query = new URLSearchParams(query).toString();
            }

            this.$router.replace(`/services/twitch?${query}`).catch(() => {});
            return true;
        }
    },

    actions: {
        AUTH: async ({ dispatch, state, rootState }) => {
            if (rootState.service.client) {
                return false;
            }

            // eslint-disable-next-line no-undef
            if (!process.env.twitch_client_id) {
                console.warn("[Twitch] There is no secrets for Twitch client");
                return false;
            }

            const config = rootState.config.twitch;
            if (!config.username || !config.access_token) {
                return await dispatch("LOGIN_ERROR");
            }

            if (config.version !== state.version) {
                return await dispatch("LOGIN_ERROR", {
                    outdated: 1
                });
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
                ...await dispatch("FORMAT_PROFILE", user),
                ...user,
                id: Number(user.id),
                link: `twitch.tv/${user.display_name}`
            }, { root: true });
            dispatch("CACHE_PROFILE", user.nickname);

            const channel = await client.channel.get(user.id);
            await dispatch("service/SET_STREAM", {
                title: channel.title,
                game: channel.game_name
            }, { root: true });

            dispatch("CONNECT", credits);
            dispatch("eventsub/CONNECT");
            dispatch("badges/LOAD", user.id);
            dispatch("emotes/LOAD", {
                id: user.id,
                name: user.nickname
            });

            return client;
        },

        LOGIN_ERROR: ({ commit, rootState }, query = {}) => {
            rootState.settings.settings.first = true;
            commit("LOGIN_REDIRECT", query);
            return false;
        },

        CONNECT: async ({ dispatch, rootState, state }, credits) => {
            rootState.service.client.tmi.on(rootState.service.client.tmi.WebsocketEvents.CONNECTED, () => {
                rootState.service.connected = true;
                return dispatch("events/ON_CONNECTED");
            });

            rootState.service.client.tmi.on("ROOMSTATE", payload => {
                payload.tags["followers-only"] = Number(payload.tags["followers-only"]);

                if (state.tags) {
                    const message = ~payload.tags["followers-only"]
                        ? global.$nuxt.$strings.NOTIFICATIONS.SYSTEM.FOLLOWERS_ONLY_ON
                        : global.$nuxt.$strings.NOTIFICATIONS.SYSTEM.FOLLOWERS_ONLY_OFF;

                    dispatch("service/ADD_SYSTEM_MESSAGE", message, { root: true });
                }

                state.tags = payload.tags;
                dispatch("events/ON_RAW_MESSAGE_FOLLOWERS_MODE");
            });

            const chat = await dispatch("service/SET_CHAT",
                await rootState.service.client.tmi.connect(credits.username, credits.access_token, [credits.username], {
                    debug: rootState.config.twitch.chatDebug,
                    secure: rootState.config.twitch.chatSecure
                }), { root: true }
            );

            chat.on("message", async message => {
                if (!rootState.settings.settings.chat.enable) {
                    return;
                }

                const profile = await dispatch("GET_PROFILE", message["display-name"]);

                if (message.color === "#000000") {
                    message.color = "#FFFFFF";
                }

                message.text = message.text.trim();

                await dispatch("service/ADD_MESSAGE", {
                    ...await dispatch("FORMAT_PROFILE", profile),
                    content: message.text,
                    badges: await dispatch("badges/FORMAT", message.badges),

                    formatted: await dispatch("FORMAT_MESSAGE", {
                        text: message.text,
                        emotes: message.emotes
                    }),

                    time: await dispatch("service/GET_CURRENT_TIME", null, { root: true }),
                    color: message.color,
                    type: message["msg-id"] || 0
                }, { root: true });
            });

            chat.on(rootState.service.client.tmi.WebsocketEvents.DISCONNECTED, () => {
                dispatch("DISCONNECT");
                return dispatch("events/ON_DISCONNECTED");
            });

            chat.on("clear", () => {
                return dispatch("events/ON_CLEAR_CHAT");
            });

            chat.on("raid", raid => {
                return dispatch("events/ON_RAID", {
                    username: raid["msg-param-displayName"],
                    viewers: raid["msg-param-displayName"]
                });
            });

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
            return profilesCache[username]
                || await dispatch("CACHE_PROFILE", username);
        },

        FORMAT_PROFILE: (_, profile) => {
            return {
                nickname: profile.display_name,
                avatar: profile.profile_image_url
            };
        },

        FORMAT_MESSAGE: async ({ dispatch }, message) => {
            let formatted = [];
            let part = "";

            const twitchEmotes = await dispatch("emotes/FORMAT_TWITCH_EMOTES", message.emotes);

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

            const { game } = await dispatch("SEARCH_GAME", data.game);
            data.game = game.name;

            await rootState.service.client.updateStream(rootState.service.user.id, data.title, data.game);
            await dispatch("service/SET_STREAM", data, { root: true });
            await dispatch("service/UPDATE_RECENT", data, { root: true });

            return game;
        },

        GET_STREAM: ({ rootState }) => {
            return rootState.service.stream;
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
            const [botsRequest, { chatters }] = await Promise.all([
                axios.get("https://api.twitchinsights.net/v1/bots/online"),
                rootState.service.client.other.getViewers(rootState.service.user.nickname)
            ]);

            if (!botsRequest?.data?.bots || !chatters) {
                return [];
            }

            const botNames = botsRequest.data.bots.map(bot => bot[0]);
            for (const category in chatters) {
                chatters[category] = lodash.difference(chatters[category], botNames);
            }

            return lodash.pickBy(chatters, category => {
                return category.length > 0;
            });
        },

        SAY: ({ rootState }, message) => {
            return rootState.service.chat.say(message, rootState.service.user.nickname);
        },

        TURN_FOLLOWERS_ONLY: ({ rootState, state }, duration = 0) => {
            if (!rootState.service.connected) {
                return false;
            }

            const user_id = rootState.service.user.id;
            rootState.service.client.chat.updateSettings(user_id, user_id, {
                follower_mode: state.tags["followers-only"] === -1,
                follower_mode_duration: duration
            });
        },

        GET_CATEGORIES: async ({ dispatch, rootState }, query) => {
            const categories = await rootState.service.client.search.categories(query);
            const games = Array.isArray(categories)
                ? categories
                : (categories ? (categories.data || [categories]) : []);

            return await Promise.map(games, async game => {
                return await dispatch("FORMAT_GAME", game);
            });
        },

        SEARCH_GAME: async ({ dispatch }, query) => {
            const games = await dispatch("GET_CATEGORIES", query);

            const gameId = query = misc.textToId(query);
            const game = games.find(game => {
                return misc.textToId(game.name) === gameId;
            });

            return {
                list: games,
                game: game || games[0]
            };
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
                icon: game.box_art_url.replace("52x72", "288x386")
            };
        }
    },

    modules: {
        formatter,

        eventsub,
        events,
        emotes,
        badges
    }
};