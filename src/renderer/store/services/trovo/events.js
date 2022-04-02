const colors = {
    default: "#21b36c",
    subscriber: "#c8a86b"
};

export default {
    namespaced: true,

    actions: {
        ON_MESSAGE: async ({ dispatch }, message) => {
            message = Object.assign(message, {
                id: message.message_id,
                nickname: message.nick_name,
                color: message.roles?.includes("subscriber") ? colors.subscriber : colors.default,
                formatted: await dispatch("trovo/FORMAT_MESSAGE", message.content, { root: true }),
                time: await dispatch("trovo/FORMAT_MESSAGE_TIME", message, { root: true })
            });
            
            return await dispatch("service/ADD_MESSAGE", message, { root: true });
        },

        ON_PAST_MESSAGES: ({ dispatch }, messages) => {
            messages.forEach(async message => {
                message.past = true;
                return await dispatch("ON_MESSAGE", message);
            });

            return messages;
        },

        ON_WELCOME: ({ dispatch, rootState }, user) => {
            if (!rootState.settings.settings.trovo.notifications.welcome) {
                return;
            }

            return dispatch("service/ADD_SYSTEM_MESSAGE", `${user.nick_name} вошёл в чат`, { root: true });
        },

        ON_FOLLOW: ({ dispatch }, follow) => {
            return dispatch("service/ADD_SYSTEM_MESSAGE", `${follow.nick_name} зафолловил канал`, { root: true });
        },

        ON_SUBSCRIPTION: ({ dispatch }, subscriber) => {
            // eslint-disable-next-line max-len
            return dispatch("service/ADD_SYSTEM_MESSAGE", `${subscriber.nick_name} оформил платную подписку`, { root: true });
        },

        ON_SPELL: ({ dispatch }, message) => {
            const user = message.nick_name;
            const spell = message.content.gift;
            const count = message.content.num;
            const cost = message.content.gift_value;
            const value = message.content.value_type;

            message.content = `${user} использует ${count}x${spell} за ${cost} ${value}`;
            return dispatch("service/ADD_SYSTEM_MESSAGE", message.content, { root: true });
        },

        ON_SUPER_CAP: ({ dispatch }, message) => {
            dispatch("ON_MESSAGE", message);
        },

        ON_ACTIVITY: ({ dispatch, rootState }, message) => {
            message.avatar = message.avatar || rootState.service.user.avatar;
            message.content = message.content.replace("{title}", "").trim();
            message.nick_name = message.nick_name || rootState.service.user.nickname;
            return dispatch("service/ADD_SYSTEM_MESSAGE", `${message.nick_name} ${message.content}`, { root: true });
        }
    }
};