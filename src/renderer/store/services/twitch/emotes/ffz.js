import misc from "~/plugins/misc";

const globalURL = "https://api.frankerfacez.com/v1/set/global";

const format = set => {
	return set.emoticons.map(emote => ({
		code: emote.name,
		url: "https:" + Object.values(emote.urls).pop()
	}));
};

const formatSets = sets => {
	return sets.map(format);
};

export default {
	namespaced: true,

	state: () => ({
		emotes: []
	}),

	actions: {
		GLOBAL: async () => {
			const response = await misc.syncRequest(globalURL);

			if (!response) {
				return [];
			}

			const values = Object.values(response.sets);
			return formatSets(values).flat(1);
		},

		CHANNEL: async (_, username) => {
			const response = await misc.syncRequest(`https://api.frankerfacez.com/v1/room/${username.toLowerCase()}`);

			return response?.room
				? format(response.sets[response.room.set])
				: [];
		}
	}
};