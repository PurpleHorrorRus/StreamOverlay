import Helix from "simple-helix-api";
import tmi from "tmi.js";

import misc from "~/plugins/misc";

const client_id = "zmin05a65f74rln2g94iv935w58nyq";

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
        credits: {},
        user: null,
        channel: null,
        helix: null,
        connected: false,
        messages: [],
        stream: {
            title: null,
            game: null
        }
    }),
    actions: {
        CREATE_HELIX: ({ state }, credits) => {
            state.credits = credits;

            state.helix = new Helix({
                client_id,
                access_token: credits.access_token,
                language: "ru"
            });
        },
        CREATE_CHATBOT: async ({ dispatch, state }) => {
            if (client || !state.helix) {
                return;
            }

            await dispatch("LOAD_EMOTES");

            state.user = await state.helix.users.get({ id: state.credits.id });
            state.channel = await state.helix.channel.get(state.credits.id);

            state.stream = {
                title: state.channel.title,
                game: state.channel.game_name
            };

            client = new tmi.Client({
                connection: { reconnect: true },
                identity: {
                    username: state.credits.username,
                    password: state.credits.oauth_token
                },
                channels: [state.credits.username]
            });

            client.connect();

            client.on("message", async (_channel, user, message) => {
                const profile = await state.helix.users.get({ login: user["display-name"] });

                if (user.color === "#000000") {
                    user.color = "#FFFFFF";
                }

                state.messages = [
                    {
                        id: Date.now(),
                        nickname: profile.display_name,
                        avatar: profile.profile_image_url,
                        badges: user.badges ? Object.keys(user.badges) : [],
                        formatted: await dispatch("FORMAT_MESSAGE", { text: message.trim(), emotes: user.emotes }),
                        color: user.color,
                        mode: user["msg-id"],
                        show: true
                    },
                    ...state.messages
                ];
            });

            client.on("connected", () => {
                state.connected = true;
                dispatch("notifications/TURN", { name: "chatdisconnect", show: false }, { root: true });
                dispatch(
                    "notifications/ADD",
                    {
                        text: "Чат успешно подключен",
                        color: "#28a745",
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
        FORMAT_MESSAGE: (_, { text, emotes }) => {
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
        BAN: ({ state }, data) => client.ban(state.credits.username, data.nickname, data.reason),
        REMOVE_MESSAGE: ({ state }, id) => {
            const index = state.messages.findIndex(m => m.id === id);
            if (~index) {
                state.messages[index].show = false;
            }
        },
        UPDATE: async ({ dispatch, state }, data) => {
            if (!data.title) data.title = state.stream.title;
            if (!data.game) data.game = state.stream.game;

            state.stream = data;
            await state.helix.updateStream(state.credits.id, data.title, data.game);
            dispatch("UPDATE_RECENT", data);

            return true;
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
            const betterttv_url = `https://api.betterttv.net/3/cached/users/twitch/${state.credits.id}`;
            const frankerfacez_url = `https://api.frankerfacez.com/v1/room/${state.credits.username.toLowerCase()}`;

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

            const fChannelPromise = new Promise(async resolve => {
                const res = await misc.syncRequest(frankerfacez_url);

                if (res.room) {
                    return resolve(
                        res.sets[res.room.set].emoticons.map(emote => {
                            const urls = Object.values(emote.urls);

                            return {
                                code: emote.name,
                                url: "https://" + urls[urls.length - 1]
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
        CHATTERS: async ({ state }) => await state.helix.other.getViewers(state.credits.username),
        SAY: ({ state }, message) => {
            if (state.connected) {
                client.say(state.credits.username, message);
            }
        }
    }
};