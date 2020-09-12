export default {
    namespaced: true,
    state: () => ({
        edit: false,
        overlays: []
    }),
    mutations: {
        enableEdit (state, seq) { 
            state.edit = seq; 
        },
        setOverlays (state, overlays) { 
            state.overlays = overlays; 
        }
    },
    actions: {
        enableEdit ({ commit }, seq) { 
            commit("enableEdit", seq); 
        },
        setOverlays ({ commit }, overlays) { 
            commit("setOverlays", overlays); 
        },
        saveOverlays ({ commit, dispatch }, overlays) { 
            commit("setOverlays", overlays);
            dispatch("settings/saveSettings", {
                type: "overlays",
                content: overlays
            }, { root: true });
        }
    },
    getters: {
        getOverlays: state => state.overlays,
        getEdit: state => state.edit
    }
};