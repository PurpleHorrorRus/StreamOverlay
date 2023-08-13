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

			state.client = rootState.service.client.EventSub;

			state.client.events.on(state.client.WebsocketEvents.CONNECTED, async () => {
				dispatch("notifications/ADD", EVENTSUB_CONNECTED, { root: true });

				for (const type of Object.keys(events.actions)) {
					await state.client.subscribe(type, conditions[0], data => {
						if (rootState.config.twitch.notifications[type]) {
							dispatch(`events/${type}`, data);
						}
					});
				}
			});

			state.client.events.on(state.client.WebsocketEvents.DISCONNECTED, reason => {
				console.error(reason);
			});

			state.client = await state.client.connect({
				debug: rootState.config.twitch.eventsubDebug
			});

			return state.client;
		}
	},

	modules: {
		events
	}
};