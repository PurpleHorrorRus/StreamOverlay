export default {
    namespaced: true,
    state: () => ({
        edit: false,
        widgets: []
    }),
    mutations: {
        TURN_EDIT: (state, sequence) => state.edit = sequence,
        SET: (state, widgets) => state.widgets = widgets
    },
    actions: {
        TURN_EDIT: ({ commit }, seq) => commit("TURN_EDIT", seq),
        SET: ({ commit }, widgets) => commit("SET", widgets),
        SAVE: ({ commit, dispatch }, widgets) => {
            commit("SET", widgets);
            dispatch("settings/SAVE", {
                type: "overlays",
                content: widgets
            }, { root: true });
        }
    }
};