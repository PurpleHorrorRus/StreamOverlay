import { TrovoAPI } from "simple-trovo-api";

import events from "~/store/services/trovo/events";
import emotes from "~/store/services/trovo/emotes";

import misc from "~/plugins/misc";

const notifications = {
    CHAT_CONNECTED: {
        text: "[Trovo] Чат успешно подключен",
        color: "#28a745",
        icon: () => import("~/assets/icons/chat-bubble.svg"),
        handle: 5
    }
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

export default {
    namespaced: true,
    actions: {
        INIT: async ({ dispatch }, config) => {
            const client = await dispatch("service/SET_CLIENT", new TrovoAPI({
                // eslint-disable-next-line no-undef
                client_id: process.env.trovo_client_id,
                access_token: config.access_token
            }), { root: true });

            let user = await client.users.getUserInfo();
            user = await dispatch("service/SET_USER", {
                ...user,
                id: Number(user.userId),
                nickname: user.nickName,
                avatar: user.profilePic,
                description: user.info
            }, { root: true });

            dispatch("emotes/LOAD");

            const channel = await client.channels.get(user.id);
            await dispatch("service/SET_STREAM", {
                title: channel.live_title,
                game: channel.category_name
            }, { root: true });
            
            let chat = await client.chat.connect();
            chat.on(chat.events.READY, () => dispatch("ON_READY"));
            chat.on(chat.events.DISCONNECTED, () => dispatch("ON_DISCONNECTED"));
            chat = await dispatch("service/SET_CHAT", chat, { root: true });

            return user;
        },

        ON_READY: ({ dispatch, rootState }) => {
            rootState.service.connected = true;

            dispatch("notifications/ADD", notifications.CHAT_CONNECTED, { root: true });
            dispatch("notifications/TURN", { 
                name: "chatdisconnect", 
                show: false 
            }, { root: true });

            rootState.service.chat.messages.on("message", async message => {
                return dispatch("events/ON_MESSAGE", {
                    id: message.message_id,
                    nickname: message.nick_name,
                    avatar: message.avatar,
                    formatted: await dispatch("FORMAT_MESSAGE", message.content),
                    time: await dispatch("FORMAT_MESSAGE_TIME", message)
                });
            });

            rootState.service.chat.messages.on(rootState.service.chat.messages.events.WELCOME, user => {
                return dispatch("events/ON_WELCOME", user);
            });

            rootState.service.chat.messages.on(rootState.service.chat.messages.events.FOLLOW, follow => {
                return dispatch("events/ON_FOLLOW", follow);
            });

            rootState.service.chat.messages.on(rootState.service.chat.messages.events.SUBSCRIPTION, follow => {
                return dispatch("events/ON_SUBSCRIPTION", follow);
            });
        },

        ON_DISCONNECTED: ({ dispatch }) => {
            dispatch("DISCONNECT");

            dispatch("notifications/TURN", { 
                name: "chatdisconnect", 
                show: true 
            }, { root: true });
        },

        DISCONNECT: ({ rootState }) => {
            const events = Object.values(rootState.service.chat.messages.events);
            ["message", ...events].forEach(event => {
                rootState.service.chat.messages.removeAllListeners(event);
            });
        },

        FORMAT_MESSAGE: async ({ dispatch }, message) => {
            let formatted = [];
            let part = "";

            const splitted = message.split(" ");
            for (let index in splitted) {
                index = Number(index);
                const word = splitted[index];

                if (!~word.indexOf(":")) {
                    if (word) {
                        part += word + " ";
                    }
                } else {
                    const [rest, emoteKey] = word.split(":");
                    if (rest.length > 0) {
                        formatted = addMessagePart(formatted, "text", part + rest);
                        part = "";
                    }

                    const emote = await dispatch("emotes/FIND_EMOTE", emoteKey);
                    if (emote) {
                        formatted = addMessagePart(formatted, "text", part);
                        formatted = addMessagePart(formatted, "emote", emote.gifp || emote.url);
                        part = "";
                    }
                }
                
                if (index === splitted.length - 1) {
                    if (part.length > 0) {
                        formatted = addMessagePart(formatted, "text", part);
                        part = "";
                    }
                    
                    return formatted;
                }
            }

            return formatted;
        },

        FORMAT_MESSAGE_TIME: (_, message) => {
            const time = new Date(message.send_time * 1000);
            return misc.formatTime({
                hours: time.getHours(),
                mins: time.getMinutes(),
                seconds: time.getSeconds()
            });
        },

        SAY: ({ rootState }, message) => {
            if (!rootState.service.connected) return;
            rootState.service.client.chat.send(message);
        },

        FORMAT_GAME: (_, game) => {
            return {
                name: game.name,
                icon: game.icon_url
            };
        },

        FIND_GAME: (_, { game, collection }) => {
            return collection.find(x => {
                return x.name === game;
            }) || collection[0];
        },

        UPDATE: async ({ dispatch, rootState }, data) => {
            if (!data.title) data.title = rootState.service.stream.title;
            if (!data.game) data.game = rootState.service.stream.game;

            const response = await rootState.service.client.categories.search(data.game);
            const game = await dispatch("FIND_GAME", {
                game: data.game,
                collection: response.category_info
            });

            data.game = game.name;

            await rootState.service.client.channel.edit(rootState.service.user.id, data.title, game.id, "RU");
            await dispatch("SET_STREAM", data);
            await dispatch("UPDATE_RECENT", data);
            
            return response.category_info[0];
        },
        
        CHATTERS: async ({ rootState }) => {
            return await rootState.service.client.channel.viewers(rootState.service.user.id);
        }
    },
    modules: {
        events,
        emotes
    }
};