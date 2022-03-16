import misc from "~/plugins/misc";

const config = {
    visibleMessagesMax: 15
};

const emptyStream = {
    title: "",
    game: ""
};

export default {
    namespaced: false,

    state: () => ({
        client: null,
        chat: null,
        user: null,
        connected: false,

        messages: [],
        stream: emptyStream
    }),

    actions: {
        CLEAR: ({ state }) => {
            state.connected = false;

            state.client = null;
            state.chat = null;
            state.user = null;

            state.messages = [];
            state.stream = emptyStream;
        },

        ADD_MESSAGE: async ({ dispatch, state, rootState }, message) => {
            message = Object.assign(message, {
                id: message.id || Date.now(),
                show: true,
                bannded: false
            });

            state.messages.unshift(message);
            dispatch("LIMIT_MESSAGES");

            if (rootState.settings.settings.chat.timeout > 0) {
                setTimeout(() => {
                    dispatch("REMOVE_MESSAGE", message.id);
                }, rootState.settings.settings.chat.timeout * 1000);
            }

            return message;
        },

        ADD_SYSTEM_MESSAGE: async ({ dispatch }, text) => {
            dispatch("ADD_MESSAGE", {
                id: Date.now(),
                nickname: "SYSTEM",
                formatted: [{
                    type: "text",
                    content: text
                }],
                time: await dispatch("twitch/FORMAT_MESSAGE_TIME", null, { root: true }),
                system: true
            });
        },

        REMOVE_MESSAGE: ({ state }, id) => {
            const message = state.messages.find(message => {
                return message.id === id;
            });
            
            if (message) message.show = false;
            return Boolean(message);
        },

        LIMIT_MESSAGES: ({ state }) => {
            const visibleMessagesCount = state.messages.filter(m => m.show).length;

            if (visibleMessagesCount > config.visibleMessagesMax) {
                for (let i = config.visibleMessagesMax; i < visibleMessagesCount; i++) {
                    if (!state.messages[i].show) break;
                    state.messages[i].show = false;
                }
            }
        },

        UPDATE_RECENT: ({ dispatch, rootState }, data) => {
            data = { ...data };
            let recent = [...rootState.config.recent];

            const index = recent.findIndex(item => {
                return item.title === data.title && item.game === data.game;
            });

            recent = ~index ? misc.arrayMove(recent, index, 0) : [data, ...recent];

            if (recent.length > 5) {
                recent = recent.splice(0, 5);
            }

            dispatch("settings/SAVE", {
                type: "recent",
                content: recent
            },{ root: true });
        }
    }
};