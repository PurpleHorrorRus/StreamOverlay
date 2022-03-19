import Promise from "bluebird";

export default {
    namespaced: true,
    state: () => ({
        list: {
            mic: false,
            sound: false,
            camera: null
        },
        sources: []
    }),
    actions: {
        GET: async ({ dispatch, state }) => {
            state.sources = await dispatch("obs/SEND", { 
                event: "GetSpecialSources" 
            }, { root: true });

            state.list = {
                mic: !(await dispatch("GET_MUTED", state.sources["mic-1"])),
                sound: !(await dispatch("GET_MUTED", state.sources["desktop-1"])),
                camera: await dispatch("UPDATE_CAMERA")
            };

            return state.sources;
        },

        GET_MUTED: async ({ dispatch }, source) => {
            const { muted } = await dispatch("obs/SEND", {
                event: "GetMute",
                args: { source }
            }, { root: true });

            return muted;
        },

        GET_VISIBLE: async ({ dispatch }, item) => {
            const result = await dispatch("obs/SEND", {
                event: "GetSceneItemProperties",
                args: { item }
            }, { root: true }).catch(() => {
                return null;
            });

            return result?.visible ?? null;
        },

        GET_CAMERA_VISIBLE: async ({ dispatch, rootState }) => {
            const mapped = await Promise.map(rootState.config.obs.camera, async item => {
                return await dispatch("GET_VISIBLE", item);
            });

            const valid = mapped.filter(m => m !== null);
            return valid.length > 0 
                ? Boolean(~valid.indexOf(true))
                : null;
        },

        UPDATE_CAMERA: async ({ dispatch, state }) => {
            state.list.camera = await dispatch("GET_CAMERA_VISIBLE");
            return state.list.camera;
        },

        ON_SOURCE_MUTE_STATE_CHANGED: ({ state }, { sourceName, muted }) => {
            switch (sourceName) {
                case state.sources["mic-1"]: {
                    state.list.mic = !muted;
                    break;
                } 
                
                case state.sources["desktop-1"]: {
                    state.list.sound = !muted;
                    break;
                }
            }
        }
    }
};