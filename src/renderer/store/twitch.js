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

export default {
    namespaced: true,
    state: () => ({
        user: null,
        helix: null,
        client: null,
        chatServer: null,
        stream: {
            title: null,
            game: null
        },
        messages: [],
        betterTTV: [],
        FrankerFaceZ: [],
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

                data.formatted = await this.dispatch("twitch/formatMessage", data);
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
        ban: (state, nickname) => state.client.ban(state.user.username, nickname, "бан стримером"),
        removeMessage: (state, id) => {
            const index = state.messages.findIndex(m => m.id === id);
            if (~index) {
                state.messages.splice(index, 1);
            }
        },
        setStream: (state, stream) => state.stream = stream,
        setViewers: (state, viewers) => state.viewers = viewers,
        loadEmotes: async state => {
            const betterttv_global_url = "https://api.betterttv.net/3/cached/emotes/global";
            const betterttv_url = `https://api.betterttv.net/3/cached/users/twitch/${state.user.id}`;
            const frankerfacez_url = `https://api.frankerfacez.com/v1/room/${state.user.username.toLowerCase()}`;

            const promises = [
                (async () => {
                    const res = await syncRequest(betterttv_global_url);

                    return res.map(emote => ({
                        code: emote.code,
                        url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
                    }));
                })(),
                (async () => {
                    const res = await syncRequest(betterttv_url);

                    return res.sharedEmotes.map(emote => ({
                        code: emote.code,
                        url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
                    }));
                })(),
                (async () => {
                    const res = await syncRequest(frankerfacez_url);
                    
                    if (res.sets[res.room.set]) {
                        return res.sets[res.room.set].emoticons.map(emote => {
                            const urls = Object.values(emote.urls);
                            
                            return {
                                code: emote.name,
                                url: urls[urls.length - 1]
                            };
                        });
                    }

                    return [];
                })()
            ];
            
            const [bGlobal, bChannel, fChannel] = await Promise.all(promises);
            state.betterTTV = [...bGlobal, ...bChannel];
            state.FrankerFaceZ = fChannel;
        },
        runInterval (state) {
            if (state.interval) {
                this.dispatch("twitch/clearInterval");
                this.dispatch("twitch/updateStats");
            }

            state.interval = setInterval(() => 
                this.dispatch("twitch/updateStats"), 20 * 1000);
        },
        clearInterval (state) {
            if (state.interval) {
                clearInterval(state.interval);
                state.interval = null;
            }
        },
        say (state, message) { 
            state.client.say(state.user.username, message); 
        },
        sendToChat (state, data) {
            state.chatServer.send(data);
        }
    },
    actions: {
        createHelix ({ commit }, twitch) { 
            commit("createHelix", twitch);
        },
        createChatBot ({ commit }) { 
            commit("createChatBot"); 
        },
        formatMessage ({ getters }, message) {
            const { text, emotes } = message;

            let ready = [];
            let emojiWords = [];

            const addEmoji = url => {
                ready = [...ready, {
                    type: "emoji",
                    content: url
                }];
            };
            
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

            const betterTTV = getters["getBetterTTV"],
                FrankerFaceZ = getters["getFrankerFaceZ"];

            const betterTTVMap = betterTTV.map(e => e.code),
                FrankerFaceZMap = FrankerFaceZ.map(e => e.code);

            let txt = "";

            const addText = () => {
                if (txt.length) {
                    ready = [...ready, {
                        type: "text",
                        content: txt
                    }];
    
                    txt = "";
                }
            };

            const splitted = text.split(" ");
            for (let wordIndex in splitted) {
                wordIndex = Number(wordIndex);
                const word = splitted[wordIndex];

                const index = emotes 
                    ? emojiWords.map(({ word }) => word).indexOf(word)
                    : -1;

                const betterTTVIndex = betterTTVMap.indexOf(word);
                const FrankerFaceZIndex = FrankerFaceZMap.indexOf(word);

                const isEmote = (~index || ~betterTTVIndex || ~FrankerFaceZIndex) !== 0;
                const isEnd = wordIndex === splitted.length - 1;
                // const isStartOrEnd = wordIndex === 0 || wordIndex === splitted.length - 1;

                if (isEmote) {
                    addText();

                    if (~index) {
                        addEmoji(emojiWords[index].url);
                        continue;
                    } else if (~betterTTVIndex) {
                        addEmoji(betterTTV[betterTTVIndex].url);
                        continue;
                    } else if (~FrankerFaceZIndex) {
                        addEmoji(FrankerFaceZ[FrankerFaceZIndex].url);
                        continue;
                    }
                } else {
                    txt += " " + word;

                    if (isEnd) {
                        addText();
                    }
                }
            }
            
            return ready;
        },
        listenCommand ({ commit }, command) { 
            commit("listenCommand", command); 
        },
        ban ({ commit }, nickname) { 
            commit("ban", nickname); 
        },
        removeMessage ({ commit }, message) { 
            commit("removeMessage", message); 
        },
        async updateStats ({ commit, dispatch, getters, rootGetters }) { 
            const helix = getters["getHelix"];
            const user = getters["getUser"];

            dispatch("followers/GET", user.id, { root: true });

            const { stream } = rootGetters["obs/getStatus"];

            if (stream) {
                const response = await helix.getStream(user.username).catch(() => commit("setViewers", -1));

                if (response) {
                    const viewers = !response.error ? response.viewer_count : -1;
                    commit("setViewers", viewers);
                }
            }
        },
        updateStream ({ commit, getters }, data) {
            return new Promise(async resolve => {
                const helix = getters["getHelix"];
                const user = getters["getUser"];
                const { status: _title, game: _game } = await helix.getChannel(user.id);
            
                const title_update = data.title !== null ? data.title : _title;
                const game_update = data.game !== null ? data.game : _game;

                const { success } = 
                    await helix.updateStream(user.id, title_update, game_update)
                        .catch(console.error);
                
                if (success) {
                    commit("setStream", {
                        title: title_update,
                        game: game_update
                    });
                }

                return resolve(success);
            });
        },
        loadEmotes ({ commit }) { 
            commit("loadEmotes");
        },
        runInterval ({ commit }) { 
            commit("runInterval"); 
        },
        clearInterval ({ commit }) { 
            commit("clearInterval"); 
        },
        say ({ commit }, message) { 
            commit("say", message); 
        },
        sendToChat ({ commit }, data) {
            commit("sendToChat", data);
        }
    },
    getters: {
        getUser: state => state.user,
        getMessages: state => state.messages,
        getHelix: state => state.helix,
        getClient: state => state.client,
        getStream: state => state.stream,
        getBetterTTV: state => state.betterTTV,
        getFrankerFaceZ: state => state.FrankerFaceZ,
        getViewers: state => state.viewers
    }
};