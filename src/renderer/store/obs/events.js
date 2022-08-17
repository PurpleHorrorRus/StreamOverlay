export default {
    namespaced: true,

    actions: {
        ON_STREAM_STARTING: ({ dispatch, rootState }) => {
            if (!rootState.obs.status.record) {
                dispatch("obs/time/SETUP", null, { root: true });
            }

            return 0;
        },

        ON_STREAM_STOPPING: ({ dispatch, rootState }) => {
            dispatch("notifications/TURN", { name: "lowbitrate", show: false }, { root: true });
            dispatch("notifications/TURN", { name: "lowfps", show: false }, { root: true });

            if (!rootState.obs.status.record) {
                dispatch("obs/time/CLEAR", null, { root: true });
            }

            return 0;
        },

        ON_RECORDING_STARTED: ({ dispatch, rootState }) => {
            if (!rootState.obs.status.stream) {
                dispatch("obs/time/SETUP", null, { root: true });
            }
        },

        ON_RECORDING_STOPPING: ({ dispatch, rootState }) => {
            if (!rootState.obs.status.stream) {
                dispatch("obs/time/CLEAR", null, { root: true });
            }
        }
    }
};