import Helix from "simple-helix-api";
import tmi from "tmi.js";

import events from "~/store/services/twitch/events";
import emotes from "~/store/services/twitch/emotes";
import badges from "~/store/services/twitch/badges";

import misc from "~/plugins/misc";

// botID = 169440375;

const types = {
    TEXT: "text",
    LINK: "link",
    EMOJI: "emote"
};

const addMessagePart = (formatted, type, content) => {
    if (typeof content === "string") {
        content = content.trim();
        if (content.length === 0) return formatted;
    }

    formatted.push({ type, content });
    return formatted;
};

let client = null;

const profilesCacheMax = 50;
let profilesCacheSize = 0;
let profilesCache = {};

// eslint-disable-next-line max-len
const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
// eslint-disable-next-line no-useless-escape
const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/;

export default {
    namespaced: true,
    
    state: () => ({
        credits: {},
        tags: null
    }),

    actions: {
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
                    time: await dispatch("FORMAT_MESSAGE_TIME"),
                    color: user.color,
                    mode: user["msg-id"]
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
                return dispatch("ADD_SYSTEM_MESSAGE", `Режим "только для фолловеров" ${enabled ? "включен" : "выключен"}`);
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

        FORMAT_MESSAGE: async ({ dispatch, state }, message) => {
            let formatted = [];
            let part = "";

            const twitchEmotes = await dispatch("emotes/FORMAT_TWITCH_EMOTES", message);
            const twitchEmotesWords = twitchEmotes.map(({ word }) => word);
            
            const splitted = message.text.split(" ");
            for (let wordIndex in splitted) {
                wordIndex = Number(wordIndex);
                const word = splitted[wordIndex];

                if (linkRegex.test(word)) {
                    addMessagePart(formatted, types.TEXT, part);
                    part = "";

                    addMessagePart(formatted, types.LINK, {
                        domain: word.match(domainRegex)[1],
                        link: word
                    });

                    continue;
                }

                const twitchEmoteIndex = twitchEmotesWords.indexOf(word);
                const bttvEmoteIndex = state.emotes.bttv.ids.indexOf(word);
                const ffzEmoteIndex = state.emotes.ffz.ids.indexOf(word);

                if (~twitchEmoteIndex || ~bttvEmoteIndex || ~ffzEmoteIndex) {
                    addMessagePart(formatted, types.TEXT, part);
                    part = "";

                    const emoji = 
                        twitchEmotes[twitchEmoteIndex]?.url
                        || state.emotes.bttv.content[bttvEmoteIndex]?.url
                        || state.emotes.ffz.content[ffzEmoteIndex]?.url;

                    addMessagePart(formatted, types.EMOJI, emoji);
                } else part += " " + word;
            }

            return addMessagePart(formatted, types.TEXT, part);
        },

        FORMAT_MESSAGE_TIME: () => {
            const time = new Date();
            return misc.formatTime({
                hours: time.getHours(),
                mins: time.getMinutes(),
                seconds: time.getSeconds()
            });
        },

        BAN: async ({ rootState }, data) => {
            data.nickname = data.nickname.toLowerCase();
            const username = rootState.service.user.nickname.toLowerCase();

            if (data.duration) {
                client.timeout(username, data.nickname, data.duration, data.reason);
            } else {
                client.ban(username, data.nickname, data.reason);
            }
        },
        
        UPDATE: async ({ dispatch, rootState }, data) => {
            if (!data.title) data.title = rootState.service.stream.title;
            if (!data.game) data.game = rootState.service.stream.game;
            
            await rootState.service.client.updateStream(rootState.service.user.id, data.title, data.game);
            await dispatch("service/SET_STREAM", data, { root: true });
            await dispatch("service/UPDATE_RECENT", data, { root: true });

            return true;
        },

        CHATTERS: async ({ rootState }) => {
            return await rootState.service.client.other.getViewers(rootState.service.user.id);
        },
        
        SAY: ({ rootState }, message) => {
            if (!rootState.service.connected) return false;
            client.say(rootState.service.user.nickname, message);
        },

        TURN_FOLLOWERS_ONLY: ({ rootState, state }, duration = 0) => {
            if (rootState.service.connected) {
                rootState.service.client.chat.updateSettings(rootState.service.user.id, rootState.service.user.id, {
                    follower_mode: state.tags["followers-only"] === "-1",
                    follower_mode_duration: duration
                });
            }
        },

        FORMAT_GAME: (_, game) => {
            return {
                name: game.name,
                icon: game.box_art_url
            };
        }
    },
    modules: {
        events,
        emotes,
        badges
    }
};