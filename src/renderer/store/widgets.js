export default {
    namespaced: true,

    state: () => ({
        edit: false,
        widgets: []
    }),

    actions: {
        TURN_EDIT: ({ state }, sequence) => {
            state.edit = sequence;
            return true;
        },

        SET: ({ state }, widgets) => {
            state.widgets = widgets;
            return true;
        },

        SAVE: ({ dispatch, state }, widgets) => {
            state.widgets = widgets;
            dispatch("settings/SAVE", {
                type: "widgets",
                content: widgets
            }, { root: true });
        }
    }
};