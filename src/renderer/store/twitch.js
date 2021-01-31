import fetch from "node-fetch";
import Helix from "simple-helix-api";
import Promise from "bluebird";

fetch.Promise = Promise;

const client_id = "zmin05a65f74rln2g94iv935w58nyq";

const syncRequest = async (url, params = {}) => {
    return await new Promise((resolve, reject) => {
        fetch(url, params)
            .then(res => {
                if (!params.raw) {
                    return res.json();
                } else {
                    return res.buffer();
                }
            })
            .then(resolve)
            .catch(reject);
    });
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
        interval: null,
        viewers: -1
    }),
    mutations: {
        createHelix (state, twitch) {
            return new Promise(async resolve => {
                state.user = twitch;

                state.helix = new Helix({ 
                    access_token: twitch.access_token, 
                    client_id, 
                    increaseRate: true 
                });

                return resolve();
            });
        },
        async createChatBot (state) {
            if (state.client || !state.helix) {
                return;
            }

            this.dispatch("followers/GET", state.user.id);
            this.dispatch("twitch/loadEmotes");

            const { status: title, game } = await state.helix.getChannel(state.user.id);
            state.stream = { title, game };

            state.client = state.helix.createChatBot(state.user.username, state.user.oauth_token, state.user.username);
            state.client.on("message", async (_channel, user, message) => {
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

                data.formatted = await this.dispatch("twitch/FORMAT_MESSAGE", data);
                state.messages = [data, ...state.messages]; 
            });

            state.client.on("connected", () => {
                this.dispatch("notifications/turnChatDisconnect", false);
                this.dispatch("notifications/addNotification", { 
                    text: "Чат успешно подключен",
                    color: "lightgreen",
                    handle: 5
                });
            });

            state.client.on("disconnected", () => this.dispatch("notifications/turnChatDisconnect", true));
        },
        removeMessage: (state, id) => {
            const index = state.messages.findIndex(m => m.id === id);
            if (~index) {
                state.messages.splice(index, 1);
            }
        },
        setStream: (state, stream) => state.stream = stream,
        setViewers: (state, viewers) => state.viewers = viewers,
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
        runInterval (state) {
            if (state.interval) {
                clearInterval(state.interval);
                state.interval = null;
                this.dispatch("twitch/updateStats");
            }

            state.interval = setInterval(() => 
                this.dispatch("twitch/updateStats"), 20 * 1000);
        }
    },
    actions: {
        createHelix: ({ commit }, twitch) => commit("createHelix", twitch),
        createChatBot: ({ commit }) => commit("createChatBot"),
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
                    formatted = addText(formatted, txt);

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
                        formatted = addText(formatted, txt);
                    }
                }
            }
            
            return formatted;
        },
        ban: ({ state }, nickname) => state.client.ban(state.user.username, nickname, "бан стримером"),
        removeMessage: ({ commit }, id) => commit("removeMessage", id),
        async updateStats ({ commit, dispatch, state, rootState }) { 
            dispatch("followers/GET", state.user.id, { root: true });

            if (rootState.obs.status.stream) {
                const response = await state.helix.getStream(state.user.username).catch(() => commit("setViewers", -1));

                if (response) {
                    const viewers = !response.error ? response.viewer_count : -1;
                    commit("setViewers", viewers);
                }
            }
        },
        async updateStream ({ commit, state }, data) {
            const { status: _title, game: _game } = await state.helix.getChannel(state.user.id);
            
            const title_update = data.title !== null ? data.title : _title;
            const game_update = data.game !== null ? data.game : _game;

            const { success } = await state.helix.updateStream(state.user.id, title_update, game_update)
                .catch(console.error);
                
            if (success) {
                commit("setStream", {
                    title: title_update,
                    game: game_update
                });
            }

            return success;
        },
        async loadEmotes ({ commit, state }) { 
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
                    
                if (res.sets[res.room.set]) {
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
        runInterval ({ commit }) { 
            commit("runInterval"); 
        }
    },
    getters: {}
};