import fetch from "node-fetch";
import Helix from "simple-helix-api";
import Promise from "bluebird";

const client_id = "zmin05a65f74rln2g94iv935w58nyq";

const syncRequest = async (url, params = {}) => {
    const response = await fetch(url, params);
    return !params.raw 
        ? response.json() 
        : response.buffer();
};

const addEmoji = (formatted, url) => {
    return [...formatted, {
        type: "emoji",
        content: url
    }];
};

const addText = (formatted, text) => {
    if (text.length) {
        return [...formatted, {
            type: "text",
            content: text
        }];
    }

    return formatted;
};

let betterTTV = null;
let FrankerFaceZ = null;

let interval = null;

export default {
    namespaced: true,
    state: () => ({
        user: null,
        helix: null,
        client: null,
        stream: {
            title: null,
            game: null
        },
        messages: [],
        viewers: -1
    }),
    mutations: {
        SET_HELIX: (state, helix) => state.helix = helix,
        SET_USER: (state, user) => state.user = user,
        SET_CLIENT: (state, client) => state.client = client,
        ADD_MESSAGE: (state, message) => state.messages = [message, ...state.messages],
        REMOVE_MESSAGE: (state, id) => {
            const index = state.messages.findIndex(m => m.id === id);
            if (~index) {
                state.messages.splice(index, 1);
            }
        },
        SET_STREAM: (state, stream) => state.stream = stream,
        SET_VIEWERS: (state, viewers) => state.viewers = viewers,
        SET_EMOTES: (state, [bGlobal, bChannel, fChannel]) => {
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
        RUN_INTERVAL (state) {
            if (interval) {
                clearInterval(interval);
                interval = null;
                this.dispatch("twitch/UPDATE_STATS");
            }

            interval = setInterval(() => 
                this.dispatch("twitch/UPDATE_STATS"), 20 * 1000);
        }
    },
    actions: {
        CREATE_HELIX: ({ commit }, twitch) => {
            commit("SET_USER", twitch);
            commit("SET_HELIX", new Helix({ 
                access_token: twitch.access_token, 
                client_id, 
                increaseRate: true 
            }));
        },
        CREATE_CHATBOT: async ({ commit, dispatch, state }) => {
            if (state.client || !state.helix) {
                return;
            }

            dispatch("followers/GET", state.user.id, { root: true });
            dispatch("LOAD_EMOTES");

            const { status: title, game } = await state.helix.getChannel(state.user.id);
            commit("SET_STREAM", { title, game });

            const client = state.helix.createChatBot(state.user.username, state.user.oauth_token, state.user.username);
            client.on("message", async (_channel, user, message) => {
                const nickname = user["display-name"];
                const profile = await state.helix.getUser(nickname);

                const data = { 
                    id: (Math.random() * 10000).toFixed(0), 
                    nickname, 
                    avatar: profile.profile_image_url, 
                    badges: user.badges ? Object.keys(user.badges) : user.badges, 
                    text: message, 
                    emotes: user.emotes, 
                    color: user.color
                };

                commit("ADD_MESSAGE", {
                    ...data,
                    formatted: await dispatch("FORMAT_MESSAGE", data)
                }); 
            });

            client.on("connected", () => {
                dispatch("notifications/turnChatDisconnect", false, { root: true });
                dispatch("notifications/addNotification", { 
                    text: "Чат успешно подключен",
                    color: "lightgreen",
                    handle: 5
                }, { root: true });
            });

            client.on("disconnected", () => dispatch("notifications/turnChatDisconnect", true, { root: true }));

            commit("SET_CLIENT", client);
        },
        FORMAT_MESSAGE: (_, message) => {
            const { text, emotes } = message;

            let formatted = [];
            let emojiWords = [];
            
            if (emotes) {
                const positions = Object.values(emotes)
                    .map(([position]) => 
                        position.split("-")
                            .map(Number));

                const ids = Object.keys(emotes);

                emojiWords = positions.map(([start, end], index) => {
                    return {
                        url: `http://static-cdn.jtvnw.net/emoticons/v1/${ids[index]}/3.0`,
                        word: text.substring(start, end + 1)
                    };
                });
            }

            let txt = "";

            const splitted = text.split(" ");
            for (let wordIndex in splitted) {
                wordIndex = Number(wordIndex);
                const word = splitted[wordIndex];

                const index = emotes 
                    ? emojiWords.map(({ word }) => word).indexOf(word)
                    : -1;

                const betterTTVIndex = betterTTV.ids.indexOf(word);
                const FrankerFaceZIndex = FrankerFaceZ.ids.indexOf(word);

                const isEmote = (~index || ~betterTTVIndex || ~FrankerFaceZIndex) !== 0;
                const isEnd = wordIndex === splitted.length - 1;
                // const isStartOrEnd = wordIndex === 0 || wordIndex === splitted.length - 1;

                if (isEmote) {
                    formatted = addText(formatted, txt.trim());
                    txt = "";

                    if (~index) {
                        formatted = addEmoji(formatted, emojiWords[index].url);
                        continue;
                    } else if (~betterTTVIndex) {
                        formatted = addEmoji(formatted, betterTTV.content[betterTTVIndex].url);
                        continue;
                    } else if (~FrankerFaceZIndex) {
                        formatted = addEmoji(formatted, FrankerFaceZ.content[FrankerFaceZIndex].url);
                        continue;
                    }
                } else {
                    txt += " " + word;

                    if (isEnd) {
                        formatted = addText(formatted, txt.trim());
                        txt = "";
                    }
                }
            }
            
            return formatted;
        },
        BAN: ({ state }, nickname) => state.client.ban(state.user.username, nickname, "бан стримером"),
        REMOVE_MESSAGE: ({ commit }, id) => commit("REMOVE_MESSAGE", id),
        UPDATE_STATS: async ({ commit, dispatch, state, rootState }) => { 
            dispatch("followers/GET", state.user.id, { root: true });

            if (rootState.obs.status.stream) {
                const response = await state.helix.getStream(state.user.username)
                    .catch(() => commit("SET_VIEWERS", -1));

                if (response) {
                    const viewers = !response.error ? response.viewer_count : -1;
                    commit("SET_VIEWERS", viewers);
                }
            }
        },
        UPDATE: async ({ commit, state }, data) => {
            const { success } = await state.helix.updateStream(state.user.id, data.title, data.game);
                
            if (success) {
                commit("SET_STREAM", data);
            }

            return success;
        },
        LOAD_EMOTES: async ({ commit, state }) => { 
            const betterttv_global_url = "https://api.betterttv.net/3/cached/emotes/global";
            const betterttv_url = `https://api.betterttv.net/3/cached/users/twitch/${state.user.id}`;
            const frankerfacez_url = `https://api.frankerfacez.com/v1/room/${state.user.username.toLowerCase()}`;

            const bGlobalPromise = new Promise(async resolve => {
                const res = await syncRequest(betterttv_global_url);

                return resolve(res.map(emote => ({
                    code: emote.code,
                    url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
                })));
            });

            const bChannelPromise = new Promise(async resolve => {
                const res = await syncRequest(betterttv_url);

                if (res.sharedEmotes) {
                    return resolve(res.sharedEmotes.map(emote => ({
                        code: emote.code,
                        url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
                    })));
                }

                return resolve([]);
            });

            const fChannelPromise = new Promise(async resolve => {
                const res = await syncRequest(frankerfacez_url);
                    
                if (res.room) {
                    return resolve(res.sets[res.room.set].emoticons.map(emote => {
                        const urls = Object.values(emote.urls);
                            
                        return {
                            code: emote.name,
                            url: urls[urls.length - 1]
                        };
                    }));
                }

                return resolve([]);
            });
            
            const emotes = await Promise.all([bGlobalPromise, bChannelPromise, fChannelPromise]);
            commit("SET_EMOTES", emotes);
        },
        RUN_INTERVAL: ({ commit }) => commit("RUN_INTERVAL")
    }
};