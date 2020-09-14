export default {
    namespaced: true,
    state: () => ({
        edit: false
    }),
    mutations: {
        enableEdit (state, seq) { 
            state.edit = seq; 
        }
    },
    actions: {
        enableEdit ({ commit }, seq) { 
            commit("enableEdit", seq); 
        },
        saveWidgets ({ dispatch }, overlays) { 
            dispatch("settings/saveSettings", {
                type: "overlays",
                content: overlays
            }, { root: true });
        }
    },
    getters: {
        getEdit: state => state.edit
    }
};