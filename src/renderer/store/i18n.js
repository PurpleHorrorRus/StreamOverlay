export default {
	namespaced: true,

	state: () => ({
		loaded: false
	}),

	actions: {
		LOAD: async ({ state }, lang = "ru") => {
			if (state.loaded) {
				return false;
			}

			const pack = (await import(`~/assets/langs/${lang}.json`)).default;
			Object.assign(global.$nuxt.$strings, pack);

			state.loaded = true;
			return Object.freeze(pack);
		}
	}
};