export default {
    namespaced: true,
    state: () => ({
        count: -1
    }),
    mutations: {
        SET_COUNT: (state, count) => state.count = count
    },
    actions: {},
    getters: {
        GET_COUNT: state => state.count
    }
};