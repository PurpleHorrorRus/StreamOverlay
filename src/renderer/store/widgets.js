export default {
    namespaced: true,
    state: () => ({
        edit: false,
        widgets: []
    }),
    mutations: {
        enableEdit (state, seq) { 
            state.edit = seq; 
        },
        setWidgets (state, widgets) { 
            state.overlays = widgets; 
        }
    },
    actions: {
        enableEdit ({ commit }, seq) { 
            commit("enableEdit", seq); 
        },
        setWidgets ({ commit }, widgets) { 
            commit("setWidgets", widgets); 
        },
        saveWidgets ({ commit, dispatch }, widgets) { 
            commit("setWidgets", widgets);
            dispatch("settings/saveSettings", {
                type: "overlays",
                content: widgets
            }, { root: true });
        }
    },
    getters: {
        getWidgets: state => state.overlays,
        getEdit: state => state.edit
    }
};