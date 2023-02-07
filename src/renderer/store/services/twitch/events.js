export default {    namespaced: true,

    actions: {
        ON_RAW_MESSAGE_FOLLOWERS_MODE: ({ dispatch, rootState }) => {
            if (~rootState.twitch.tags["followers-only"]) {
                dispatch("notifications/ADD", {
                    text: global.$nuxt.$strings.NOTIFICATIONS.TWITCH.FOLLOWERS_ONLY,
                    color: "#6441A4",
                    icon: () => import("~icons/twitch.svg"),
                    handle: 5
                }, { root: true });
            }
        },

        ON_CONNECTED: ({ dispatch, rootState }) => {
            dispatch("notifications/TURN", {
                name: "chatdisconnect",
                show: false
            }, { root: true });

            if (rootState.config.settings.chat.enable) {
                dispatch("notifications/ADD", {
                    text: global.$nuxt.$strings.NOTIFICATIONS.CONNECTED,
                    color: "#28a745",
                    icon: () => import("~icons/twitch.svg"),
                    handle: 5
                }, { root: true });
            }
        },

        ON_DISCONNECTED: ({ dispatch, rootState }) => {
            if (rootState.config.settings.chat.enable) {
                dispatch("notifications/TURN", {
                    name: "chatdisconnect",
                    show: true
                }, { root: true });
            }
        },

        ON_CLEAR_CHAT: ({ dispatch }) => {
            return dispatch(
                "service/ADD_SYSTEM_MESSAGE",
                global.$nuxt.$strings.NOTIFICATIONS.TWITCH.SYSTEM.CLEAR,
                { root: true }
            );
        },

        ON_RAID: ({ dispatch }, { username, viewers }) => {
            return dispatch(
                "twitch/SAY",

                global.$nuxt.i18n(
                    global.$nuxt.$strings.NOTIFICATIONS.SYSTEM.RAID,
                    ["username", "viewers"],
                    [username, viewers]
                ), { root: true });
        }
    }
};