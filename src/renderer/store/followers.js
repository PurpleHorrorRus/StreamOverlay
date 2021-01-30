export default {
    namespaced: true,
    state: () => ({
        count: -1
    }),
    mutations: {
        SET_COUNT: (state, count) => state.count = count
    },
    actions: {
        GET: async ({ commit, rootState }, id) => {
            const count = await rootState.twitch.helix.getFollowersCount(id);
            commit("SET_COUNT", count);
            return count;
        }
    },
    getters: {}
};