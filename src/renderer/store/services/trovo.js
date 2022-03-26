import { TrovoAPI } from "simple-trovo-api";
import lodash from "lodash";

import events from "~/store/services/trovo/events";
import emotes from "~/store/services/trovo/emotes";

import misc from "~/plugins/misc";

// eslint-disable-next-line max-len
const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
// eslint-disable-next-line no-useless-escape
const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/;

const notifications = {
    CHAT_CONNECTED: {
        text: "[Trovo] Чат успешно подключен",
        color: "#28a745",
        icon: () => import("~/assets/icons/chat-bubble.svg"),
        handle: 5
    }
};

const addMessagePart = (formatted, type, content) => {
    if (typeof content === "string") {
        content = content.trim();
        if (content.length === 0) return formatted;
    }

    formatted.push({ type, content });
    return formatted;
};

export default {
    namespaced: true,

    actions: {
        INIT: async ({ dispatch, rootState }) => {
            let client = new TrovoAPI({
                // eslint-disable-next-line no-undef
                client_id: process.env.trovo_client_id,
                // eslint-disable-next-line no-undef
                client_secret: process.env.trovo_client_secret,
                redirect_uri: "https://purplehorrorrus.github.io/token",
                credits: rootState.config.paths.trovo
            });

            const credits = rootState.config.trovo;
            client = await client.auth(credits.access_token, credits.refresh_token);
            client = await dispatch("service/SET_CLIENT", client, { root: true });

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

        FORMAT_MESSAGE_OBJECT: async ({ dispatch }, message) => {
            return {
                ...message,
                id: message.message_id,
                nickname: message.nick_name,
                formatted: await dispatch("FORMAT_MESSAGE", message.content),
                time: await dispatch("FORMAT_MESSAGE_TIME", message)
            };
        },

        ON_READY: ({ dispatch, rootState }) => {
            rootState.service.connected = true;

            dispatch("notifications/ADD", notifications.CHAT_CONNECTED, { root: true });
            dispatch("notifications/TURN", { 
                name: "chatdisconnect", 
                show: false 
            }, { root: true });

            rootState.service.chat.messages.on("message", async message => {
                message = await dispatch("FORMAT_MESSAGE_OBJECT", message);
                return await dispatch("events/ON_MESSAGE", message);
            });

            rootState.service.chat.messages.once("past_messages", messages => {
                return messages.forEach(async message => {
                    message = await dispatch("FORMAT_MESSAGE_OBJECT", message);
                    return await dispatch("events/ON_MESSAGE", message);
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

            rootState.service.chat.messages.on(rootState.service.chat.messages.events.SPELLS, spell => {
                return dispatch("events/ON_SPELL", spell);
            });

            rootState.service.chat.messages.on(rootState.service.chat.messages.events.SUPER_CAP, message => {
                return dispatch("events/ON_SUPER_CAP", message);
            });

            rootState.service.chat.messages.on(rootState.service.chat.messages.events.ACTIVITY, message => {
                return dispatch("events/ON_ACTIVITY", message);
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
            rootState.service.connected = false;
            
            const events = Object.values(rootState.service.chat.messages.events);
            ["message", ...events].forEach(event => {
                rootState.service.chat.messages.removeAllListeners(event);
            });
        },

        FORMAT_MESSAGE: async ({ dispatch }, message) => {
            const formatted = [];
            let part = "";

            const splitted = message
                .replaceAll("https://", "www.")
                .split(/(?=[ :])/g).map(w => w.trim())
                .filter(w => w.length > 0);

            for (let index in splitted) {
                index = Number(index);
                const word = splitted[index];

                if (linkRegex.test(word)) { // Format link
                    addMessagePart(formatted, "text", part);
                    part = "";

                    addMessagePart(formatted, "link", { 
                        domain: word.match(domainRegex)[1].replace("www.", ""), 
                        link: word.replace("www.", "https://")
                    });

                    continue;
                }

                if (~word.indexOf(":")) {
                    const emote = await dispatch("emotes/FIND_EMOTE", word); // Format Emote
                    
                    if (emote) {
                        addMessagePart(formatted, "text", part);
                        part = "";
    
                        addMessagePart(formatted, "emote", emote.gifp || emote.url);
                        continue;
                    }
                }

                part += word + " ";
            }

            return addMessagePart(formatted, "text", part);
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
            if (!rootState.service.connected) return false;
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
            await dispatch("service/SET_STREAM", data, { root: true });
            await dispatch("service/UPDATE_RECENT", data, { root: true });
            
            return response.category_info[0];
        },

        BAN: async ({ rootState }, data) => {
            const command = data.timeout > 0
                ? `ban ${data.nickname} ${data.timeout}`
                : `ban ${data.nickname}`;

            return await rootState.service.client.chat.command(command, rootState.service.user.id);
        },

        CHATTERS: async ({ rootState }) => {
            // eslint-disable-next-line max-len
            const { chatters, custom_roles } = await rootState.service.client.channel.viewers(rootState.service.user.id);
            let allRoles = Object.assign(chatters, custom_roles);

            allRoles = lodash.pickBy(allRoles, category => {
                return category.viewers.length > 0;
            });

            allRoles = lodash.mapValues(allRoles, category => {
                return category.viewers;
            });

            allRoles = lodash.pickBy(allRoles, category => {
                return category.length > 0;
            });

            const entries = Object.entries(allRoles);
            for (let i = 0; i < entries.length; i++) {
                for (let j = i + 1; j < entries.length; j++) {
                    if (entries[i][1].length > 0) {
                        entries[i][1] = lodash.difference(entries[i][1], entries[j][1]);
                    }
                }
            }

            allRoles = Object.fromEntries(entries);
            return lodash.pickBy(allRoles, category => {
                return category.length > 0;
            });
        }
    },
    modules: {
        events,
        emotes
    }
};