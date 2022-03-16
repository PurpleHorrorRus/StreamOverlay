export default {
    namespaced: true,
    actions: {
        ON_MESSAGE: async ({ dispatch }, message) => {
            return await dispatch("trovo/ADD_MESSAGE", message, { root: true });
        },

        ON_WELCOME: ({ dispatch }, user) => {
            return dispatch("trovo/ADD_SYSTEM_MESSAGE", `${user.nick_name} вошёл в чат`, { root: true });
        },

        ON_FOLLOW: ({ dispatch }, follow) => {
            return dispatch("trovo/ADD_SYSTEM_MESSAGE", `${follow.nick_name} зафолловил канал`, { root: true });
        },

        ON_SUBSCRIPTION: ({ dispatch }, subscriber) => {
            // eslint-disable-next-line max-len
            return dispatch("trovo/ADD_SYSTEM_MESSAGE", `${subscriber.nick_name} оформил платную подписку`, { root: true });
        },

        ON_SPELL: ({ dispatch }, message) => {
            // eslint-disable-next-line max-len
            return dispatch("trovo/ADD_SYSTEM_MESSAGE", `${message.nick_name} использует ${message.content.gift} за ${message.content.num} маны`, { root: true });
        }
    }
};