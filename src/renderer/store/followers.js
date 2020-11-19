export default {
    namespaced: true,
    state: () => ({
        count: -1
    }),
    mutations: {
        SET_COUNT: (state, count) => state.count = count
    },
    actions: {
        START: async ({ dispatch }, id) => setInterval(() => dispatch("GET"), 20 * 1000),
        GET: async ({ commit, rootGetters }, id) => {
            const count = await rootGetters["twitch/getHelix"]
                .getFollowersCount(id);

            commit("SET_COUNT", count);
            return count;
        }
    },
    getters: {
        GET_COUNT: state => state.count
    }
};