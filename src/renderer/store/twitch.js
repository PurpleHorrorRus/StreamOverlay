import fetch from "node-fetch";
import Helix from "simple-helix-api";
import Promise from "bluebird";

import misc from "~/plugins/misc";

const client_id = "zmin05a65f74rln2g94iv935w58nyq";

const syncRequest = async (url, params = {}) => {
    const response = await fetch(url, params);
    return !params.raw ? response.json() : response.buffer();
};

const addPart = (formatted, type, content) => {
    if (content.length > 0) {
        return [...formatted, { type, content }];
    }

    return formatted;
};

let client = null;

let betterTTV = null,
    FrankerFaceZ = null;

export default {
    namespaced: true,
    state: () => ({
        user: null,
        helix: null,
        connected: false,
        messages: [],
        stream: {
            title: null,
            game: null
        }
    }),
    actions: {
        CREATE_HELIX: ({ state }, twitch) => {
            twitch.id = Number(twitch.id);
            state.user = twitch;

            state.helix = new Helix({
                access_token: twitch.access_token,
                client_id,
                increaseRate: true
            });
        },
        CREATE_CHATBOT: async ({ dispatch, state }) => {
            if (client || !state.helix) {
                return;
            }

            await dispatch("LOAD_EMOTES");

            const { status: title, game } = await state.helix.getChannel(state.user.id);
            state.stream = { title, game };

            client = state.helix.createChatBot(state.user.username, state.user.oauth_token, state.user.username);
            client.on("message", async (_channel, user, message) => {
                const nickname = user["display-name"];
                const profile = await state.helix.getUser(nickname);

                const data = {
                    id: Math.random() * 1000,
                    nickname,
                    avatar: profile.profile_image_url,
                    badges: user.badges ? Object.keys(user.badges) : [],
                    text: message,
                    emotes: user.emotes,
                    color: user.color,
                    mode: user["msg-id"],
                    show: true
                };

                data.formatted = await dispatch("FORMAT_MESSAGE", data);
                state.messages = [data, ...state.messages];
            });

            client.on("connected", () => {
                state.connected = true;
                dispatch("notifications/TURN", { name: "chatdisconnect", show: false }, { root: true });
                dispatch(
                    "notifications/ADD",
                    {
                        text: "Чат успешно подключен",
                        color: "lightgreen",
                        handle: 5
                    },
                    { root: true }
                );
            });

            client.on("disconnected", () => {
                state.connected = false;
                dispatch("notifications/TURN", { name: "chatdisconnect", show: true }, { root: true });
            });
        },
        FORMAT_MESSAGE: (_, message) => {
            const { text, emotes } = message;

            let formatted = [];
            let emojiWords = [];

            if (emotes) {
                const positions = Object.values(emotes).map(([position]) => position.split("-").map(Number));

                const ids = Object.keys(emotes);
                emojiWords = positions.map(([start, end], index) => {
                    return {
                        url: `http://static-cdn.jtvnw.net/emoticons/v1/${ids[index]}/3.0`,
                        word: text.substring(start, end + 1)
                    };
                });
            }

            let part = "";
            const splitted = text.split(" ");
            for (let wordIndex in splitted) {
                wordIndex = Number(wordIndex);
                const word = splitted[wordIndex];

                const twitchIndex = emotes ? emojiWords.map(({ word }) => word).indexOf(word) : -1;
                const betterTTVIndex = betterTTV.ids.indexOf(word);
                const FrankerFaceZIndex = FrankerFaceZ.ids.indexOf(word);

                if ((~twitchIndex || ~betterTTVIndex || ~FrankerFaceZIndex) !== 0) {
                    formatted = addPart(formatted, "text", part.trim());
                    part = "";

                    if (~twitchIndex) {
                        formatted = addPart(formatted, "emoji", emojiWords[twitchIndex].url);
                        continue;
                    } else if (~betterTTVIndex) {
                        formatted = addPart(formatted, "emoji", betterTTV.content[betterTTVIndex].url);
                        continue;
                    } else if (~FrankerFaceZIndex) {
                        formatted = addPart(formatted, "emoji", FrankerFaceZ.content[FrankerFaceZIndex].url);
                        continue;
                    }
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
        BAN: ({ state }, data) => client.ban(state.user.username, data.nickname, data.reason),
        REMOVE_MESSAGE: ({ state }, id) => {
            const index = state.messages.findIndex(m => m.id === id);
            if (~index) {
                state.messages[index].show = false;
            }
        },
        UPDATE: async ({ dispatch, state }, data) => {
            const { success } = await state.helix.updateStream(state.user.id, data.title, data.game);

            if (success) {
                state.stream = data;
                dispatch("UPDATE_RECENT", data);
            }

            return success;
        },
        UPDATE_RECENT: ({ dispatch, rootState }, data) => {
            let recent = [...rootState.config.recent];
            const index = recent.findIndex(item => item.title === data.title && item.game === data.game);
            recent = ~index ? misc.array_move(recent, index, 0) : [data, ...recent];

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
        LOAD_EMOTES: async ({ state }) => {
            const betterttv_global_url = "https://api.betterttv.net/3/cached/emotes/global";
            const betterttv_url = `https://api.betterttv.net/3/cached/users/twitch/${state.user.id}`;
            const frankerfacez_url = `https://api.frankerfacez.com/v1/room/${state.user.username.toLowerCase()}`;

            const bGlobalPromise = new Promise(async resolve => {
                const res = await syncRequest(betterttv_global_url);

                return resolve(
                    res.map(emote => ({
                        code: emote.code,
                        url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
                    }))
                );
            });

            const bChannelPromise = new Promise(async resolve => {
                const res = await syncRequest(betterttv_url);

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

            const fChannelPromise = new Promise(async resolve => {
                const res = await syncRequest(frankerfacez_url);

                if (res.room) {
                    return resolve(
                        res.sets[res.room.set].emoticons.map(emote => {
                            const urls = Object.values(emote.urls);

                            return {
                                code: emote.name,
                                url: urls[urls.length - 1]
                            };
                        })
                    );
                }

                return resolve([]);
            });

            const [bGlobal, bChannel, fChannel] = await Promise.all([bGlobalPromise, bChannelPromise, fChannelPromise]);
            const bttv = [...bGlobal, ...bChannel];

            betterTTV = {
                content: bttv,
                ids: bttv.map(e => e.code)
            };

            FrankerFaceZ = {
                content: fChannel,
                ids: fChannel.map(e => e.code)
            };
        },
        SAY: ({ state }, message) => {
            if (state.connected) {
                client.say(state.user.username, message);
            }
        }
    }
};