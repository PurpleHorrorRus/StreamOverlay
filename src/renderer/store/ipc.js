export default {
    namespaced: true,
    state: () => ({ 
        locked: false 
    }),
    mutations: {
        turnLock (state, mouse) { 
            state.locked = mouse; 
        }
    },
    actions: {
        turnLock ({ commit }, mouse) { 
            commit("turnLock", mouse);
        }
    },
    getters: {
        getLock (state) { 
            return state.locked; 
        }
    }
};