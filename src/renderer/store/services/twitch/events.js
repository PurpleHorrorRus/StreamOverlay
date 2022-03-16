const notifications = {
    FOLLOWERS_MODE_ENABLED: {
        text: "[Twitch] На канале включен режим \"Только для фолловеров\"",
        color: "#6441A4",
        icon: () => import("~/assets/icons/twitch.svg"),
        handle: 5
    },
    
    CHAT_CONNECTED: {
        text: "[Twitch] Чат успешно подключен",
        color: "#28a745",
        icon: () => import("~/assets/icons/chat-bubble.svg"),
        handle: 5
    }
};

export default {
    namespaced: true,
    actions: {
        ON_RAW_MESSAGE_FOLLOWERS_MODE: ({ dispatch, rootState }) => {
            const followersMode = Number(rootState.twitch.tags["followers-only"]);

            if (followersMode === 0) {
                dispatch("notifications/ADD", notifications.FOLLOWERS_MODE_ENABLED, { root: true });
            }
        },

        ON_CONNECTED: ({ dispatch, rootState }) => {
            dispatch("notifications/TURN", { name: "chatdisconnect", show: false }, { root: true });

            if (rootState.settings.settings.chat.enable) {
                dispatch("notifications/ADD", notifications.CHAT_CONNECTED, { root: true });
            }
        },

        ON_DISCONNECTED: ({ dispatch, rootState }) => {
            if (rootState.settings.settings.chat.enable) {
                dispatch("notifications/TURN", { name: "chatdisconnect", show: true }, { root: true });
            }
        },

        ON_CLEAR_CHAT: ({ dispatch }) => {
            return dispatch("service/ADD_SYSTEM_MESSAGE", "Чат был очищен", { root: true });
        },

        ON_BAN: ({ dispatch }, username) => {
            return dispatch("service/ADD_SYSTEM_MESSAGE", `Пользователь ${username} заблокирован`, { root: true });
        },
        
        ON_RAID: ({ dispatch }, { username, viewers }) => {
            return dispatch("twitch/SAY", `Рейд от ${username}! Зрителей: ${viewers}`, { root: true });
        }
    }
};