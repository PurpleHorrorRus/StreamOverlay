export default {
    namespaced: true,
    state: () => ({
        edit: false,
        widgets: []
    }),
    actions: {
        TURN_EDIT: ({ state }, sequence) => (state.edit = sequence),
        SET: ({ state }, widgets) => (state.widgets = widgets),
        SAVE: ({ dispatch, state }, widgets) => {
            state.widgets = widgets;
            dispatch(
                "settings/SAVE",
                {
                    type: "widgets",
                    content: widgets
                },
                { root: true }
            );
        }
    }
};