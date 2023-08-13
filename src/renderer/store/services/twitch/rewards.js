export default {
	namespaced: true,

	state: () => ({
		list: []
	}),

	actions: {
		LOAD: async ({ state, rootState }) => {
			let rewards = await rootState.service.client.rewards.all(rootState.service.user.id);

			if (!Array.isArray(rewards)) {
				rewards = [rewards];
			}

			state.list = rewards;
			return state.list;
		}
	}
};