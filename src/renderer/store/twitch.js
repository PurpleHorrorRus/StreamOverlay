import { ipcRenderer } from "electron-better-ipc";

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
        viewers: -1,
        followers: -1
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

            this.dispatch("twitch/loadEmotes");

            const { status: title, game } = await state.helix.getChannel(state.user.id);
            state.stream = { title, game };

            state.client = state.helix.createChatBot(state.user.username, state.user.oauth_token, state.user.username);
            state.client.on("message", async (_channel, user, message) => {
                const nickname = user["display-name"];
                const profile = await state.helix.getUser(nickname);
                const { profile_image_url: avatar } = profile;
                const { color } = user;
                const badges = user.badges ? Object.keys(user.badges) : user.badges;

                this.dispatch("twitch/pushMessage", { 
                    id: (Math.random() * 10000).toFixed(0), 
                    nickname, 
                    avatar, 
                    badges, 
                    text: message, 
                    emotes: 
                    user.emotes, 
                    color 
                });
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
        pushMessage (state, message) { 
            state.messages = [message, ...state.messages]; 
        },
        ban (state, nickname) { 
            state.client.ban(state.user.username, nickname, "бан стримером"); 
        },
        removeMessage (state, message) {
            const index = state.messages.findIndex(m => m.id === message.id);
            if (!~index) {
                return;
            }
            state.messages.splice(index, 1); 
        },
        setStream (state, stream) { 
            state.stream = stream; 
        },
        setFollowersCount (state, count) {
            state.followers = count;
        },
        setViewers (state, viewers) {
            state.viewers = viewers;
        },
        updateStream(state, stream) { 
            state.stream = stream; 
        },
        loadEmotes (state) {
            const success = title => {
                console.log("%s%c%s", `${title} `, "color: lightgreen", "[OK]");
            };

            const fail = title => {
                console.log("%s%c%s", `${title} `, "color: red", "[Fail]");
            };

            const betterttv_global_url = "https://api.betterttv.net/3/cached/emotes/global";
            syncRequest(betterttv_global_url).then(res => {
                for (const emote of res) {
                    state.betterTTV = [...state.betterTTV, {
                        code: emote.code,
                        url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
                    }];
                }
                success("Global BTTV Emotes");
            }).catch(() => fail("Global BTTV Emotes"));
            
            const betterttv_url = `https://api.betterttv.net/3/cached/users/twitch/${state.user.id}`;
            syncRequest(betterttv_url).then(res => {
                for (const emote of res.sharedEmotes) {
                    state.betterTTV = [...state.betterTTV, {
                        code: emote.code,
                        url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
                    }];
                }
                success("Channel BTTV Emotes");
            }).catch(() => fail("Channel BTTV Emotes"));


            const frankerfacez_url = `https://api.frankerfacez.com/v1/room/${state.user.username.toLowerCase()}`;
            syncRequest(frankerfacez_url).then(res => {
                const id = res.room.set;
                for (const franker_emote of res.sets[id].emoticons) {
                    let lastURLIndex = 1;
                    for (const obj in franker_emote.urls) {
                        lastURLIndex = obj;
                    }
                    
                    state.FrankerFaceZ = [...state.FrankerFaceZ, {
                        code: franker_emote.name,
                        url: `https://${franker_emote.urls[lastURLIndex]}`
                    }];
                }

                success("FrankerFaceZ Channel Emotes");
            }).catch(() => fail("FrankerFaceZ Channel Emotes"));
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
        pushMessage ({ commit }, message) { 
            commit("pushMessage", message); 
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
        async updateStats ({ commit, getters, rootGetters }) { 
            const helix = getters["getHelix"];
            const user = getters["getUser"];

            const count = await helix.getFollowersCount(user.id);
            commit("setFollowersCount", count);

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
        getFollowers: state => state.followers,
        getViewers: state => state.viewers
    }
};