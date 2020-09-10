import { fork } from "child_process";
import { encode } from "querystring";
import { join } from "path";
import fetch from "node-fetch";
import fs from "fs";
import Helix from "simple-helix-api";
import Promise from "bluebird";

import sound from "~/sounds/sound.mp3";
import misc from "~/plugins/misc";

fetch.Promise = Promise;

const ReadJSON = dir => JSON.parse(fs.readFileSync(dir, "UTF-8"));

const twitchPath = join("config", "twitch.json");
const data = ReadJSON(twitchPath);
const { id, username, access_token, oauth_token } = data;
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
        user: { 
            id,
            username 
        },
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
        async createHelix (state, helix) {
            state.helix = helix;
        },
        async createChatBot (state) {
            if (state.client || !state.helix) {
                return;
            }

            this.dispatch("twitch/loadEmotes");

            const { status: title, game } = await state.helix.getChannel(state.user.id);
            state.stream = { title, game };

            state.client = state.helix.createChatBot("BernkastelBot", oauth_token, username);
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

                const { chat } = this.getters["settings/getSettings"];
                if (chat.sound && chat.sound_file.length) {
                    this.dispatch("twitch/playSound");
                }
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
            console.log(message);
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
        updateStream (state, stream) { 
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
            state.interval = setInterval(() => this.dispatch("twitch/updateStats"), 20 * 1000);
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
        createHelix ({ commit }) { 
            const helix = new Helix({ 
                access_token, 
                client_id, 
                increaseRate: true 
            });
            commit("createHelix", helix);
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
        async updateStats ({ dispatch, commit, getters, rootGetters }) { 
            dispatch("lastFollower");

            const helix = getters["getHelix"];
            const user = getters["getUser"];

            const count = await helix.getFollowersCount(user.id);
            commit("setFollowersCount", count);

            const text = fs.readFileSync("./config/followers.json");
            const json = JSON.parse(text);
            const fileCount = json.length;

            if (count !== fileCount) { 
                dispatch("checkFool", {
                    newCount: count,
                    oldCount: fileCount
                });
            }

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
        loadEmotes({ commit }) { 
            commit("loadEmotes");
        },
        playSound () {
            const audio = new Audio(sound);
            audio.play();
        },
        runInterval({ commit }) { 
            commit("runInterval"); 
        },
        clearInterval({ commit }) { 
            commit("clearInterval"); 
        },
        say({ commit }, message) { 
            commit("say", message); 
        },
        sendToChat ({ commit }, data) {
            commit("sendToChat", data);
        }
    },
    getters: {
        getUser(state) { 
            return state.user; 
        },
        getMessages(state) { 
            return state.messages; 
        },
        getHelix(state) { 
            return state.helix; 
        },
        getClient: state => state.client,
        getStream(state) { 
            return state.stream; 
        },
        async getChannel(state) { 
            return await state.helix.getChannel(state.user.id); 
        },
        async getTopGames(state) { 
            return await state.helix.getTopGames(); 
        },
        getBetterTTV(state) { 
            return state.betterTTV; 
        },
        getFrankerFaceZ(state) { 
            return state.FrankerFaceZ; 
        },
        getFollowers(state) { 
            return state.followers; 
        },
        getViewers(state) { 
            return state.viewers; 
        }
    }
};