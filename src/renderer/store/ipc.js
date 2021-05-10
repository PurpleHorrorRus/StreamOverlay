export default {
    namespaced: true,
    state: () => ({ 
        locked: false 
    }),
    actions: {
        TURN_LOCK: ({ state }, mouse) => state.locked = mouse
    }
};