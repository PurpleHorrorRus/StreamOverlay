export default {
    namespaced: true,
    state: () => ({ 
        locked: false 
    }),
    mutations: {
        TURN_LOCK: (state, mouse) => state.locked = mouse
    },
    actions: {
        TURN_LOCK: ({ commit }, mouse) => commit("TURN_LOCK", mouse)
    }
};