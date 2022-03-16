import Promise from "bluebird";

import Helix from "simple-helix-api";
import tmi from "tmi.js";

import service from "~/store/service";

import events from "~/store/services/twitch/events";
import emotes from "~/store/services/twitch/emotes";
import badges from "~/store/services/twitch/badges";

import misc from "~/plugins/misc";

// botID = 169440375;

const types = {
    TEXT: "text",
    LINK: "link",
    EMOJI: "emoji"
};

const addMessagePart = (formatted, type, content) => {
    if (content.length > 0) {
        return [...formatted, { 
            type, 
            content: content.trim() 
        }];
    }

    return formatted;
};

let client = null;

let utterQuery = [];
let utter = null;

const profilesCacheMax = 50;
let profilesCacheSize = 0;
let profilesCache = {};

// eslint-disable-next-line max-len
const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

// eslint-disable-next-line no-undef
if (process.client) {
    utter = new SpeechSynthesisUtterance();
    utter.lang = "ru-RU";
    utter.onend = async () => {
        utterQuery.splice(0, 1);
        if (utterQuery.length > 0) {
            utter.text = utterQuery[0];
            await new Promise(resolve => setTimeout(resolve, 500));
            speechSynthesis.speak(utter);
        }
    };
}

export default {
    namespaced: true,
    state: () => ({
        credits: {},
        tags: null
    }),
    actions: {
        INIT: async ({ dispatch, state }, credits) => {
            state.credits = credits;

            state.service.client = new Helix({
                // eslint-disable-next-line no-undef
                client_id: process.env.twitch_client_id,
                access_token: credits.access_token,
                language: "ru"
            });

            state.service.user = await state.service.client.users.getByLogin(state.credits.username);
            profilesCache[state.credits.username] = state.service.user;
            
            const channel = await state.service.client.channel.get(state.service.user.id);
            state.service.stream = {
                title: channel.title,
                game: channel.game_name
            };

            dispatch("CONNECT");
            dispatch("badges/LOAD", state.service.user.id);
            dispatch("emotes/LOAD", {
                id: state.service.user.id,
                name: state.credits.username
            });

            return state.service.client;
        },

        CONNECT: async ({ dispatch, rootState, state }) => {
            state.service.chat = new tmi.Client({
                connection: { reconnect: true },
                identity: {
                    username: state.credits.username,
                    password: state.credits.oauth_token
                },
                channels: [state.credits.username]
            });

            state.service.chat.on("message", async (_, user, message) => {
                if (!rootState.settings.settings.chat.enable) {
                    return;
                }

                const profile = await dispatch("GET_PROFILE", user["display-name"]);
                
                if (user.color === "#000000") {
                    user.color = "#FFFFFF";
                }

                message = message.trim();
                
                await dispatch("ADD_MESSAGE", {
                    nickname: profile.display_name,
                    avatar: profile.profile_image_url,
                    badges: await dispatch("badges/FORMAT", user.badges),
                    formatted: await dispatch("FORMAT_MESSAGE", { text: message, emotes: user.emotes }),
                    color: user.color,
                    mode: user["msg-id"],
                    show: true,
                    banned: false
                });

                if (rootState.settings.settings.chat.sound) {
                    dispatch("PLAY_SOUND");
                }

                if (rootState.settings.settings.chat.tts.enable) {
                    dispatch("VOICE_MESSAGE", {
                        name: profile.display_name,
                        message
                    });
                }
            });

            state.service.chat.on("raw_message", (_, message) => {
                if (message.command === "ROOMSTATE" && !state.tags) {
                    state.tags = message.tags;
                    return dispatch("events/ON_RAW_MESSAGE_FOLLOWERS_MODE");
                }
            });

            state.service.chat.on("followersonly", (_, enabled) => {
                state.tags["followers-only"] = enabled ? "0" : "-1";
                
                // eslint-disable-next-line max-len
                return dispatch("ADD_SYSTEM_MESSAGE", `Режим "только для фолловеров" ${enabled ? "включен" : "выключен"}`);
            });

            state.service.chat.on("connected", () => {
                state.service.chat.raw("CAP REQ :twitch.tv/tags");
                state.service.connected = true;
                return dispatch("events/ON_CONNECTED");
            });

            state.service.chat.on("disconnected", () => {
                state.service.connected = false;
                state.tags = null;

                return dispatch("events/ON_DISCONNECTED");
            });

            state.service.chat.on("ban", (_, username) => {
                for (const message of rootState.twitch.messages) {
                    if (username === message.nickname) {
                        message.banned = true;
                    }
                }

                return dispatch("events/ON_BAN", username);
            });

            state.service.chat.on("clearchat", () => {
                return dispatch("events/ON_CLEAR_CHAT");
            });

            state.service.chat.on("raided", (_, username, viewers) => {
                return dispatch("events/ON_RAID", { username, viewers });
            });
            
            state.service.chat.connect();
        },

        CACHE_PROFILE: async ({ state }, username) => {
            profilesCache[username] = await state.service.client.users.getByLogin(username);

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

        PLAY_SOUND: () => {
            const sound = new Audio("notification.mp3");
            sound.volume = 0.6;
            sound.play();
        },

        FORMAT_MESSAGE: async ({ dispatch, state }, message) => {
            let formatted = [];
            let part = "";

            const twitchEmotes = await dispatch("emotes/FORMAT_TWITCH_EMOTES", message);
            const twitchEmotesWords = twitchEmotes.map(({ word }) => word);
            
            const splitted = message.text.split(" ");
            for (let wordIndex = 0; wordIndex < splitted.length; wordIndex++) {
                const word = splitted[wordIndex];

                if (linkRegex.test(word)) {
                    if (part.length > 0) {
                        formatted = addMessagePart(formatted, types.TEXT, part);
                        part = "";
                    }

                    formatted = addMessagePart(formatted, types.LINK, word);
                    continue;
                }

                const twitchEmoteIndex = twitchEmotesWords.indexOf(word);
                const bttvEmoteIndex = state.emotes.bttv.ids.indexOf(word);
                const ffzEmoteIndex = state.emotes.ffz.ids.indexOf(word);

                if (~twitchEmoteIndex || ~bttvEmoteIndex || ~ffzEmoteIndex) {
                    if (part.length > 0) {
                        formatted = addMessagePart(formatted, types.TEXT, part);
                        part = "";
                    }

                    const emoji = 
                        twitchEmotes[twitchEmoteIndex]?.url
                        || state.emotes.bttv.content[bttvEmoteIndex]?.url
                        || state.emotes.ffz.content[ffzEmoteIndex]?.url;

                    formatted = addMessagePart(formatted, types.EMOJI, emoji);
                } else {
                    part += " " + word;

                    if (wordIndex === splitted.length - 1) {
                        formatted = addMessagePart(formatted, types.TEXT, part);
                        part = "";
                    }
                }
            }

            return formatted;
        },

        FORMAT_MESSAGE_TIME: () => {
            const time = new Date();
            return misc.formatTime({
                hours: time.getHours(),
                mins: time.getMinutes(),
                seconds: time.getSeconds()
            });
        },

        VOICE_MESSAGE: ({ rootState }, { name, message, forceName }) => {
            const readName = rootState.settings.settings.chat.tts.readName || forceName;
            utter.text = readName ? `${name} сказал ${message}` : message;
            utterQuery.push(utter.text);

            if (utterQuery.length === 1) {
                speechSynthesis.speak(utter);
            }
        },

        REMOVE_MESSAGE: ({ state }, id) => {
            state.service.messages.find(message => {
                return message.id === id;
            }).show = false;

            return true;
        },

        BAN: async ({ state }, data) => {
            data.nickname = data.nickname.toLowerCase();

            if (data.duration) {
                client.timeout(state.credits.username.toLowerCase(), data.nickname, data.duration, data.reason);
            } else {
                client.ban(state.credits.username.toLowerCase(), data.nickname, data.reason);
            }
        },
        
        UPDATE: async ({ dispatch, state }, data) => {
            if (!data.title) data.title = state.service.stream.title;
            if (!data.game) data.game = state.service.stream.game;

            state.service.stream = data;
            await state.service.client.updateStream(state.service.user.id, data.title, data.game);
            dispatch("UPDATE_RECENT", data);

            return true;
        },

        CHATTERS: async ({ state }) => {
            return await state.service.client.other.getViewers(state.credits.username);
        },
        
        SAY: ({ state }, message) => {
            if (!state.service.connected) return false;
            client.say(state.credits.username, message);
        },

        TURN_FOLLOWERS_ONLY: ({ state }, duration = 0) => {
            if (state.service.connected) {
                state.service.client.chat.updateSettings(state.service.user.id, state.service.user.id, {
                    follower_mode: state.tags["followers-only"] === "-1",
                    follower_mode_duration: duration
                });
            }
        }
    },
    modules: {
        service,

        events,
        emotes,
        badges
    }
};