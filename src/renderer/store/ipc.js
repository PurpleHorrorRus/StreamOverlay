export default {
    namespaced: true,

    state: () => ({
        locked: false
    }),

    actions: {
        TURN_LOCK: ({ state }, mouse) => {
            state.locked = mouse;
            return global.$nuxt.$ipc.send("turnMouse", mouse);
        }
    }
};