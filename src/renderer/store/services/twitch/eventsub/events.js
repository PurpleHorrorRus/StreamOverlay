const timeout = 10;

export default {
    namespaced: true,

    state: () => ({}),

    actions: {
        "channel.update": async ({ dispatch }, data) => {
            dispatch("service/SET_STREAM", {
                title: data.title,
                game: data.category_name
            }, { root: true });

            const { game } = await dispatch("SERVICE_DISPATCH", {
                action: "SEARCH_GAME",
                data: data.category_name
            }, { root: true });

            return dispatch("notifications/ADD", {
                presense: true,
                image: game.icon,
                text: data.title,
                handle: timeout,

                action: {
                    icon: () => import("~icons/gamepad.svg"),
                    text: data.category_name
                }
            }, { root: true });
        },

        "channel.follow": async ({ dispatch, rootState }, data) => {
            const userId = Number(data.user_id);
            const user = await rootState.service.client.users.getByID(userId);

            return dispatch("notifications/ADD", {
                presense: true,
                image: user.profile_image_url,

                text: global.$nuxt.$i18n(
                    global.$nuxt.$strings.NOTIFICATIONS.TWITCH.EVENTSUB_EVENTS.FOLLOW.DESCRIPTION,
                    "username",
                    user.display_name
                ),

                handle: timeout,

                action: {
                    icon: () => import("~icons/heart.svg"),
                    text: global.$nuxt.$strings.NOTIFICATIONS.TWITCH.EVENTSUB_EVENTS.FOLLOW.TITLE
                }
            }, { root: true });
        },

        "channel.subscribe": async ({ dispatch, rootState }, data) => {
            const user = await rootState.service.client.users.get(Number(data.user_id));

            return dispatch("notifications/ADD", {
                presense: true,
                image: user.profile_image_url,

                text: global.$nuxt.$i18n(
                    global.$nuxt.$strings.NOTIFICATIONS.TWITCH.EVENTSUB_EVENTS.SUBSCRIBER.DESCRIPTION,
                    "username",
                    user.display_name
                ),

                handle: timeout,

                action: {
                    icon: () => import("~icons/star.svg"),
                    text: global.$nuxt.$strings.NOTIFICATIONS.TWITCH.EVENTSUB_EVENTS.SUBSCRIBER.TITLE
                }
            }, { root: true });
        },

        "channel.ban": async ({ dispatch, rootState }, data) => {
            const user = await rootState.service.client.users.get(Number(data.user_id));

            for (const message of rootState.service.messages) {
                if (user.display_name === message.nickname) {
                    message.banned = true;
                }
            }

            return dispatch("notifications/ADD", {
                presense: true,
                image: user.profile_image_url,

                text: global.$nuxt.$i18n(
                    global.$nuxt.$strings.NOTIFICATIONS.TWITCH.EVENTSUB_EVENTS.BAN.DESCRIPTION,
                    "username",
                    user.display_name
                ),

                handle: timeout,

                action: {
                    icon: () => import("~icons/x.svg"),
                    text: global.$nuxt.$strings.NOTIFICATIONS.TWITCH.EVENTSUB_EVENTS.BAN.TITLE
                }
            }, { root: true });
        },

        "stream.online": async ({ dispatch, rootState }) => {
            return dispatch("notifications/ADD", {
                presense: true,
                image: rootState.service.user.avatar,
                text: global.$nuxt.$strings.NOTIFICATIONS.TWITCH.EVENTSUB_EVENTS.STREAM_ONLINE.DESCRIPTION,
                handle: timeout,

                action: {
                    text: global.$nuxt.$i18n(
                        global.$nuxt.$strings.NOTIFICATIONS.TWITCH.EVENTSUB_EVENTS.STREAM_ONLINE.TITLE,
                        "username",
                        rootState.service.user.nickname
                    )
                }
            }, { root: true });
        }
    }
};