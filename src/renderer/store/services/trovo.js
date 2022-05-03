import { TrovoAPI } from "simple-trovo-api";
import lodash from "lodash";

import events from "~/store/services/trovo/events";
import emotes from "~/store/services/trovo/emotes";

import misc from "~/plugins/misc";

// eslint-disable-next-line no-undef
const isDev =  process.env.NODE_ENV === "development";
const trovoParams = {
    messages: {
        fetchPastMessages: isDev
    }
};

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

const colors = {
    default: "#21b36c",
    subscriber: "#c8a86b"
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

    mutations: {
        LOGIN_REDIRECT() {
            this.$router.replace("/services/trovo").catch(() => {});
            return true;
        }
    },

    actions: {
        AUTH: async ({ dispatch, rootState }) => {
            if (rootState.service.client) {
                return false;
            }

            // eslint-disable-next-line no-undef
            if (!process.env.trovo_client_id || !process.env.trovo_client_secret) {
                console.warn("[Trovo] There is no secrets for Trovo client");
                return false;
            }

            const config = rootState.config.trovo;
            if (!config.access_token) {
                return await dispatch("LOGIN_ERROR");
            }

            const response = await dispatch("INIT", config).catch(async () => {
                return await dispatch("LOGIN_ERROR");
            });

            return Boolean(response);
        },

        INIT: async ({ dispatch, rootState }, credits) => {
            let client = new TrovoAPI({
                // eslint-disable-next-line no-undef
                client_id: process.env.trovo_client_id,
                // eslint-disable-next-line no-undef
                client_secret: process.env.trovo_client_secret,
                redirect_uri: "https://purplehorrorrus.github.io/token",
                credits: rootState.config.paths.trovo
            });

            client = await client.auth(credits.access_token, credits.refresh_token).catch(e => {
                throw e;
            });

            client.requests.on("error", () => dispatch("LOGIN_ERROR"));
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
            
            let chat = await client.chat.connect(trovoParams);
            chat.on(chat.events.READY, () => dispatch("ON_READY"));
            chat.on(chat.events.DISCONNECTED, () => dispatch("ON_DISCONNECTED"));
            chat = await dispatch("service/SET_CHAT", chat, { root: true });

            return user;
        },

        LOGIN_ERROR: ({ commit, rootState }) => {
            rootState.settings.settings.first = true;
            commit("LOGIN_REDIRECT");
            return false;
        },

        ON_READY: ({ dispatch, rootState }) => {
            rootState.service.connected = true;

            dispatch("notifications/ADD", notifications.CHAT_CONNECTED, { root: true });
            dispatch("notifications/TURN", { 
                name: "chatdisconnect", 
                show: false 
            }, { root: true });

            const eventNames = Object.keys(events.actions);
            for (const event of eventNames) {
                if (event !== "COMMAND") {
                    dispatch("REGISTER_EVENT", event);
                }
            }
        },

        REGISTER_EVENT: ({ dispatch, rootState }, event) => {
            rootState.service.chat.messages.on(event.toLowerCase(), async data => {
                if (Array.isArray(data)) {
                    await dispatch(`events/${event}`, data);
                    return false;
                }

                const formatted = await dispatch("FORMAT", data);
                return await dispatch(`events/${event}`, formatted);
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

        FORMAT: async ({ dispatch }, message) => {
            return Object.assign(message, {
                id: message.message_id,
                nickname: message.nick_name,
                color: message.roles?.includes("subscriber") ? colors.subscriber : colors.default,
                time: await dispatch("FORMAT_MESSAGE_TIME", message)
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

                if (word.includes(":")) { // Format Emote
                    const emote = await dispatch("emotes/FIND_EMOTE", word);
                    
                    if (emote) {
                        addMessagePart(formatted, "text", part);
                        part = "";
    
                        addMessagePart(formatted, "emote", emote.gifp || emote.url);
                        continue;
                    }
                }

                part += word + " "; // Add word to part
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

        SEARCH_GAME: async ({ rootState }, query) => {
            const response = await rootState.service.client.categories.search(query);
            return response.category_info;
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

        GET_STREAM: async ({ rootState }) => {
            const channel = await rootState.service.client.channels.get(rootState.service.user.nickname);
            return {
                title: channel.live_title,
                game: channel.category_name
            };
        },

        VIEWERS_COUNT: async ({ rootState }) => {
            const channel = await rootState.service.client.channels.get(rootState.service.user.nickname);
            return channel?.current_viewers;
        },

        FOLLOWERS_COUNT: async ({ rootState }) => {
            const follows = await rootState.service.client.channel.followers(rootState.service.user.id);
            return Number(follows?.total) || 0;
        },

        CHATTERS: async ({ rootState }) => {
            const client = rootState.service.client;
            const user_id = rootState.service.user.id;
            const { chatters, custome_roles } = await client.channel.viewers(user_id);
            let allRoles = { ...chatters, ...custome_roles };

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
            for (let i = 0; i < entries.length - 1; i++) {
                for (let j = i + 1; j < entries.length; j++) {
                    entries[i][1] = lodash.difference(entries[i][1], entries[j][1]);
                    entries[j][1] = lodash.difference(entries[j][1], entries[i][1]);
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