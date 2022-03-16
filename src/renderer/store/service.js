import misc from "~/plugins/misc";

const config = {
    visibleMessagesMax: 15
};

export default {
    namespaced: false,

    state: () => ({
        client: null,
        chat: null,
        user: null,
        connected: false,

        messages: [],
        stream: {
            title: "",
            game: ""
        }
    }),

    actions: {
        ADD_MESSAGE: async ({ dispatch, state, rootState }, message) => {
            message = {
                ...message,
                formatted: await dispatch("FORMAT_MESSAGE", message.content),
                time: await dispatch("FORMAT_MESSAGE_TIME", message),
                show: true,
                banned: false
            };

            state.messages.unshift(message);
            dispatch("LIMIT_MESSAGES");

            if (rootState.settings.settings.chat.timeout > 0) {
                setTimeout(() => {
                    dispatch("REMOVE_MESSAGE", message.message_id);
                }, rootState.settings.settings.chat.timeout * 1000);
            }

            return message;
        },

        ADD_SYSTEM_MESSAGE: ({ dispatch }, text) => {
            dispatch("ADD_MESSAGE", {
                message_id: Date.now(),
                nick_name: "SYSTEM",
                content: text,
                send_time: Math.floor(new Date() / 1000),
                show: true,
                banned: false,
                system: true
            });
        },

        LIMIT_MESSAGES: ({ state }) => {
            const visibleMessagesCount = state.service.messages.filter(m => m.show).length;

            if (visibleMessagesCount > config.visibleMessagesMax) {
                for (let i = config.visibleMessagesMax; i < visibleMessagesCount; i++) {
                    if (!state.service.messages[i].show) break;
                    state.service.messages[i].show = false;
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