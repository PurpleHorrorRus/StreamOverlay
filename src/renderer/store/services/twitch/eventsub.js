import { delay } from "bluebird";

import events from "./eventsub/events";

const EVENTSUB_CONNECTED = {
    text: "Служба оповещений подключена",
    color: "#28a745",
    icon: () => import("~icons/twitch.svg"),
    handle: 5
};

export default {
    namespaced: true,

    state: () => ({
        client: null
    }),

    actions: {
        CONNECT: async ({ dispatch, state, rootState }) => {
            if (state.client) {
                return state.client;
            }

            const conditions = [{
                broadcaster_user_id: String(rootState.service.user.id)
            }];

            const eventsubClient = rootState.service.client.EventSub;

            eventsubClient.events.on(eventsubClient.WebsocketEvents.CONNECTED, () => {
                dispatch("notifications/ADD", EVENTSUB_CONNECTED, { root: true });
            });

            eventsubClient.events.on(eventsubClient.WebsocketEvents.DISCONNECTED, async reason => {
                console.error(reason);
                await delay(4000);
                state.client = null;
                return await dispatch("CONNECT");
            });

            state.client = await rootState.service.client.EventSub.connect({
                debug: rootState.config.twitch.eventsubDebug
            });

            if (state.client) {
                for (const type of Object.keys(events.actions)) {
                    await state.client.subscribe(type, conditions[0], data => {
                        if (rootState.config.twitch.notifications[type]) {
                            dispatch(`events/${type}`, data);
                        }
                    });
                }
            }

            return state.client;
        }
    },

    modules: {
        events
    }
};