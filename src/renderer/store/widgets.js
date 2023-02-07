export default {
    namespaced: true,

    state: () => ({
        edit: false
    }),

    actions: {
        TURN_EDIT: ({ state }, sequence) => {
            state.edit = sequence;
            return state.edit;
        }
    }
};