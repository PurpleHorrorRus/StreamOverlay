import Helix from "simple-helix-api";
import tmi from "tmi.js";
import { lookup } from "dns";
import { delay } from "bluebird";

import misc from "~/plugins/misc";
import notification from "~/static/notification.mp3";

const client_id = "zmin05a65f74rln2g94iv935w58nyq";

const addPart = (formatted, type, content) => {
    if (content.length > 0) {
        return [...formatted, { type, content }];
    }

    return formatted;
};

let client = null;

let BetterTTV = null,
    FrankerFaceZ = null;

let utterQuery = [];
let utter = null;

const profilesCacheMax = 50;
let profilesCacheSize = 0;
let profilesCache = {};

const visibleMessagesMax = 15;

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
        user: null,
        channel: null,
        helix: null,
        tags: null,
        connected: false,
        online: true,
        badges: {},
        messages: [],
        stream: {
            title: null,
            game: null
        }
    }),
    actions: {
        CHECK_CONNECTION: (_, options = {}) =>
            new Promise(resolve => lookup("twitch.tv", options, err => resolve(!(err && err.code)))),

        AWAIT_CONNECTION: ({ dispatch, state }) => {
            return new Promise(async resolve => {
                state.online = await dispatch("CHECK_CONNECTION");

                if (!state.online) {
                    await delay(2000);
                    return resolve(await dispatch("AWAIT_CONNECTION"));
                }

                return resolve(true);
            });
        },
        CREATE_HELIX: async ({ dispatch, state }, credits) => {
            state.credits = credits;

            state.helix = new Helix({
                client_id,
                access_token: credits.access_token,
                language: "ru"
            });

            await dispatch("AWAIT_CONNECTION");

            state.user = await state.helix.users.getByLogin(state.credits.username);
            state.channel = await state.helix.channel.get(state.user.id);
            profilesCache[state.credits.username] = state.user;

            state.stream = {
                title: state.channel.title,
                game: state.channel.game_name
            };

            dispatch("LOAD_BADGES").then(badges => state.badges = badges);
            dispatch("LOAD_EMOTES").then(({ bttv, ffz }) => {
                BetterTTV = bttv;
                FrankerFaceZ = ffz;
            });
        },
        CREATE_CHATBOT: async ({ dispatch, state, rootState }) => {
            if (client || !state.helix) {
                return;
            }

            client = new tmi.Client({
                connection: { reconnect: true },
                identity: {
                    username: state.credits.username,
                    password: state.credits.oauth_token
                },
                channels: [state.credits.username]
            });

            client.on("message", async (_channel, user, message) => {
                if (!rootState.settings.settings.chat.enable) {
                    return;
                }

                const username = user["display-name"];
                if (!profilesCache[username]) {
                    profilesCache[username] = await state.helix.users.getByLogin(username);

                    if (profilesCacheSize > profilesCacheMax - 1) {
                        profilesCache = Object.fromEntries(
                            Object.entries(profilesCache)
                                .splice(Object.values(profilesCache).length - profilesCacheMax)
                        );
                    } else profilesCacheSize++;
                }

                const profile = profilesCache[username];

                if (user.color === "#000000") {
                    user.color = "#FFFFFF";
                }

                message = message.trim();
                
                await dispatch("ADD_MESSAGE", {
                    nickname: profile.display_name,
                    avatar: profile.profile_image_url,
                    badges: user.badges ? await dispatch("FORMAT_BADGES", user.badges) : [],
                    formatted: await dispatch("FORMAT_MESSAGE", { text: message, emotes: user.emotes }),
                    color: user.color,
                    mode: user["msg-id"],
                    show: true,
                    banned: false
                });

                if (rootState.settings.settings.chat.sound) {
                    const sound = new Audio(notification);
                    sound.volume = 0.6;
                    sound.play();
                }

                if (rootState.settings.settings.chat.tts.enable) {
                    utter.text = rootState.settings.settings.chat.tts.readName
                        ? `${profile.display_name} сказал ${message}`
                        : message;

                    utterQuery = [...utterQuery, utter.text];

                    if (utterQuery.length === 1) {
                        speechSynthesis.speak(utter);
                    }
                }
            });

            client.on("raw_message", (_, message) => {
                if (message.command === "ROOMSTATE" && !state.tags) {
                    state.tags = message.tags;
                }
            });

            client.on("followersonly", (_, enabled) => (state.tags["followers-only"] = enabled ? "0" : "-1"));

            client.on("connected", () => {
                client.raw("CAP REQ :twitch.tv/tags");

                state.connected = true;
                dispatch("notifications/TURN", { name: "chatdisconnect", show: false }, { root: true });

                if (rootState.settings.settings.chat.enable) {
                    dispatch(
                        "notifications/ADD",
                        {
                            text: "Чат успешно подключен",
                            color: "#28a745",
                            icon: () => import("~/assets/icons/chat-bubble.svg"),
                            handle: 5
                        },
                        { root: true }
                    );
                }
            });

            client.on("disconnected", () => {
                state.connected = false;
                state.tags = null;

                if (rootState.settings.settings.chat.enable) {
                    dispatch("notifications/TURN", { name: "chatdisconnect", show: true }, { root: true });
                }
            });

            client.connect();
        },
        FORMAT_BADGES: ({ state }, badges) =>
            Object.keys(badges)
                .map(badge => state.badges[badge] || null)
                .filter(badge => badge !== null),
        FORMAT_TWITCH_EMOTES: (_, message) => {
            const positions = Object.values(message.emotes).map(([position]) => position.split("-").map(Number));
            const ids = Object.keys(message.emotes);

            return positions.map(([start, end], index) => {
                return {
                    url: `http://static-cdn.jtvnw.net/emoticons/v1/${ids[index]}/3.0`,
                    word: message.text.substring(start, end + 1)
                };
            });
        },
        FORMAT_MESSAGE: async ({ dispatch }, message) => {
            const { text, emotes } = message;
        
            let formatted = [];
            const emojiWords = emotes && Object.keys(emotes).length > 0 
                ? await dispatch("FORMAT_TWITCH_EMOTES", message) 
                : [];
        
            let part = "";
            const splitted = text.split(" ");
            for (let wordIndex in splitted) {
                wordIndex = Number(wordIndex);
                const word = splitted[wordIndex];
        
                const twitchIndex = emotes ? emojiWords.map(({ word }) => word).indexOf(word) : -1;
                const betterTTVIndex = BetterTTV.ids.indexOf(word);
                const FrankerFaceZIndex = FrankerFaceZ.ids.indexOf(word);
        
                if ((~twitchIndex || ~betterTTVIndex || ~FrankerFaceZIndex) !== 0) {
                    if (part.length > 0) {
                        formatted = addPart(formatted, "text", part.trim());
                        part = "";
                    }
        
                    if (~twitchIndex) {
                        formatted = addPart(formatted, "emoji", emojiWords[twitchIndex].url);
                        continue;
                    } else if (~betterTTVIndex) {
                        formatted = addPart(formatted, "emoji", BetterTTV.content[betterTTVIndex].url);
                        continue;
                    } else if (~FrankerFaceZIndex) {
                        formatted = addPart(formatted, "emoji", FrankerFaceZ.content[FrankerFaceZIndex].url);
                        continue;
                    }
                } else if (linkRegex.test(word)) {
                    if (part.length > 0) {
                        formatted = addPart(formatted, "text", part.trim());
                        part = "";
                    }
        
                    formatted = addPart(formatted, "link", word);
                } else {
                    part += " " + word;
        
                    if (wordIndex === splitted.length - 1) {
                        formatted = addPart(formatted, "text", part.trim());
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
        ADD_MESSAGE: async ({ dispatch, state, rootState }, message) => {
            message = {
                id: Date.now(),
                time: await dispatch("FORMAT_MESSAGE_TIME"),
                ...message
            };

            state.messages.unshift(message);

            if (state.messages.filter(m => m.show).length > visibleMessagesMax) {
                [...state.messages]
                    .splice(visibleMessagesMax, state.messages.filter(m => m.show).length - 1)
                    .map(m => state.messages.find(_m => _m.id === m.id).show = false);
            }
            
            if (rootState.settings.settings.chat.timeout > 0) {
                setTimeout(
                    () => (state.messages.find(m => m.id === message.id).show = false),
                    rootState.settings.settings.chat.timeout * 1000
                );
            }

            return message;
        },
        BAN: ({ state }, data) => client.ban(state.user.display_name, data.nickname, data.reason),
        UPDATE: async ({ dispatch, state }, data) => {
            if (!data.title) data.title = state.stream.title;
            if (!data.game) data.game = state.stream.game;

            state.stream = data;
            await state.helix.updateStream(state.user.id, data.title, data.game);
            dispatch("UPDATE_RECENT", data);

            return true;
        },
        UPDATE_RECENT: ({ dispatch, rootState }, data) => {
            let recent = [...rootState.config.recent];
            const index = recent.findIndex(item => item.title === data.title && item.game === data.game);
            recent = ~index ? misc.arrayMove(recent, index, 0) : [data, ...recent];

            if (recent.length > 5) {
                recent = recent.splice(0, 5);
            }

            dispatch(
                "settings/SAVE",
                {
                    type: "recent",
                    content: recent
                },
                { root: true }
            );
        },
        LOAD_BADGES: async ({ state }) => {
            state.badges = Object.fromEntries(
                Object.values({
                    ...(await state.helix.badges.global()),
                    ...(await state.helix.badges.channel(state.user.id))
                })
                    .map(({ set_id, versions }) =>
                        Object.entries({
                            [set_id]: versions ? versions[0].image_url_1x : ""
                        })
                    )
                    .flat(1)
            );
        },
        LOAD_EMOTES: async ({ state }) => {
            const betterttv_global_url = "https://api.betterttv.net/3/cached/emotes/global",
                betterttv_url = `https://api.betterttv.net/3/cached/users/twitch/${state.user.id}`,
                frankerfacez_global_url = "https://api.frankerfacez.com/v1/set/global",
                frankerfacez_url = `https://api.frankerfacez.com/v1/room/${state.credits.username.toLowerCase()}`;

            const bGlobalPromise = new Promise(async resolve => {
                const res = await misc.syncRequest(betterttv_global_url);

                return resolve(
                    res.map(emote => ({
                        code: emote.code,
                        url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
                    }))
                );
            });

            const bChannelPromise = new Promise(async resolve => {
                const res = await misc.syncRequest(betterttv_url);

                if (res.sharedEmotes) {
                    return resolve(
                        res.sharedEmotes.map(emote => ({
                            code: emote.code,
                            url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
                        }))
                    );
                }

                return resolve([]);
            });

            const fGlobalPromise = new Promise(async resolve => {
                const res = await misc.syncRequest(frankerfacez_global_url);
                return resolve(
                    Object.values(res.sets)
                        .map(set => {
                            return set.emoticons.map(emote => {
                                const urls = Object.values(emote.urls);

                                return {
                                    code: emote.name,
                                    url: "https:" + urls[urls.length - 1]
                                };
                            });
                        })
                        .flat(1)
                );
            });

            const fChannelPromise = new Promise(async resolve => {
                const res = await misc.syncRequest(frankerfacez_url);

                if (res.room) {
                    return resolve(
                        res.sets[res.room.set].emoticons.map(emote => {
                            const urls = Object.values(emote.urls);

                            return {
                                code: emote.name,
                                url: "https:" + urls[urls.length - 1]
                            };
                        })
                    );
                }

                return resolve([]);
            });

            const [bGlobal, bChannel, fGlobal, fChannel] = await Promise.all([
                bGlobalPromise,
                bChannelPromise,
                fGlobalPromise,
                fChannelPromise
            ]);

            const collection = arr => ({
                content: arr,
                ids: arr.map(e => e.code)
            });
            
            return {
                bttv: collection([...bGlobal, ...bChannel]),
                ffz: collection([...fGlobal, ...fChannel])
            };
        },
        CHATTERS: async ({ state }) => await state.helix.other.getViewers(state.credits.username),
        SAY: ({ state }, message) => {
            if (state.connected) {
                client.say(state.credits.username, message);
            }
        },
        TURN_FOLLOWERS_ONLY: ({ state }, duration = 0) => {
            if (state.connected) {
                state.tags["followers-only"] !== "-1"
                    ? client.followersonlyoff(state.credits.username)
                    : client.followersonly(state.credits.username, duration);
            }
        }
    }
};