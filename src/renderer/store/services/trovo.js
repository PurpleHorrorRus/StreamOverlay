import { TrovoAPI } from "simple-trovo-api";

import service from "~/store/service";

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
        INIT: async ({ dispatch, state }, access_token) => {
            state.service.client = new TrovoAPI({
                // eslint-disable-next-line no-undef
                client_id: process.env.client_id,
                access_token
            });

            state.service.user = await state.service.client.users.getUserInfo();
            state.service.user.userId = Number(state.service.user.userId);
            dispatch("emotes/LOAD");

            const channel = await state.service.client.channels.get(state.service.user.userId);
            state.service.stream.title = channel.live_title;
            state.service.stream.game = channel.category_name;
            
            state.service.chat = await state.service.client.chat.connect();
            state.service.chat.on(state.service.chat.events.READY, () => dispatch("ON_READY"));
            state.service.chat.on(state.service.chat.events.DISCONNECTED, () => dispatch("ON_DISCONNECTED"));

            return state.service.user;
        },

        ON_READY: ({ dispatch, state }) => {
            state.service.connected = true;

            dispatch("notifications/ADD", notifications.CHAT_CONNECTED, { root: true });
            dispatch("notifications/TURN", { 
                name: "chatdisconnect", 
                show: false 
            }, { root: true });

            state.service.chat.messages.on("message", message => {
                return dispatch("events/ON_MESSAGE", message);
            });

            state.service.chat.messages.on(state.service.chat.messages.events.WELCOME, user => {
                return dispatch("events/ON_WELCOME", user);
            });

            state.service.chat.messages.on(state.service.chat.messages.events.FOLLOW, follow => {
                return dispatch("events/ON_FOLLOW", follow);
            });

            state.service.chat.messages.on(state.service.chat.messages.events.SUBSCRIPTION, follow => {
                return dispatch("events/ON_SUBSCRIPTION", follow);
            });
        },

        ON_DISCONNECTED: ({ dispatch, state }) => {
            state.service.connected = false;

            dispatch("notifications/TURN", { 
                name: "chatdisconnect", 
                show: true 
            }, { root: true });

            const events = Object.values(state.service.chat.messages.events);
            ["message", ...events].forEach(event => {
                state.service.chat.messages.removeAllListeners(event);
            });
        },

        REMOVE_MESSAGE: ({ state }, id) => {
            state.service.messages.find(message => {
                return message.message_id === id;
            }).show = false;

            return true;
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

        SAY: ({ state }, message) => {
            if (!state.service.connected) return;
            state.service.client.chat.send(message);
        },

        FIND_GAME: (_, { game, collection }) => {
            return collection.find(x => {
                return x.name === game;
            }) || collection[0];
        },

        UPDATE_STREAM: async ({ dispatch, state }, data) => {
            if (!data.title) {
                const channel = await state.service.client.channels.get(Number(state.service.user.userId));
                data.title = channel.live_title;
            }

            const response = await state.service.client.categories.search(data.game);
            const game = await dispatch("FIND_GAME", {
                game: data.game,
                collection: response.category_info
            });

            data.game = game.name;

            await state.service.client.channel.edit(state.service.user.userId, data.title, game.id, "RU");
            state.service.stream = data;
            dispatch("UPDATE_RECENT", data);
            
            return response.category_info[0];
        },
        
        CHATTERS: async ({ state }) => {
            return await state.service.client.channel.viewers(state.service.user.userId);
        }
    },
    modules: {
        service,

        events,
        emotes
    }
};