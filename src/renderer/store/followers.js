export default {
	namespaced: true,

	state: () => ({
		count: 0,
		latest: {}
	}),

	actions: {
		START: async ({ dispatch }) => {
			await dispatch("CHECK");
			setInterval(() => dispatch("CHECK"), 15 * 1000);
			return true;
		},

		CHECK: async ({ dispatch, state }) => {
			const count = await dispatch("SERVICE_DISPATCH", "FOLLOWERS_COUNT", { root: true });

			if (count !== state.count) {
				state.count = count;
			}

			return count;
		}
	}
};