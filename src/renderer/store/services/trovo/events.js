export default {
    namespaced: true,
    actions: {
        ON_MESSAGE: async ({ dispatch }, message) => {
            return await dispatch("service/ADD_MESSAGE", message, { root: true });
        },

        ON_WELCOME: ({ dispatch }, user) => {
            return dispatch("service/ADD_SYSTEM_MESSAGE", `${user.nickname} вошёл в чат`, { root: true });
        },

        ON_FOLLOW: ({ dispatch }, follow) => {
            return dispatch("service/ADD_SYSTEM_MESSAGE", `${follow.nickname} зафолловил канал`, { root: true });
        },

        ON_SUBSCRIPTION: ({ dispatch }, subscriber) => {
            // eslint-disable-next-line max-len
            return dispatch("service/ADD_SYSTEM_MESSAGE", `${subscriber.nickname} оформил платную подписку`, { root: true });
        },

        ON_SPELL: ({ dispatch }, message) => {
            // eslint-disable-next-line max-len
            return dispatch("service/ADD_SYSTEM_MESSAGE", `${message.nickname} использует ${message.content.gift} за ${message.content.num} маны`, { root: true });
        }
    }
};