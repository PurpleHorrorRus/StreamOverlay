import Promise from "bluebird";
import OBSWebSocket, { EventSubscription } from "obs-websocket-js";

import events from "~/store/obs/events";
import devices from "~/store/obs/devices";
import time from "~/store/obs/time";

let interval = null;

export default {
    namespaced: true,

    state: () => ({
        obs: { socket: undefined },
        videoSettings: null,
        scene: null,

        status: {
            stream: false,
            record: false,
            
            tech: {
                fps: 0
            }
        }
    }),

    actions: {
        CONNECT: async ({ dispatch, state, rootState }) => {
            if (state.obs.socket) {
                return false;
            }

            const credits = rootState.config.obs;
            const address = `ws://${credits.address}:${credits.port}`;
            const obs = new OBSWebSocket();
            const connected = await obs.connect(address, undefined, {
                eventSubscriptions: EventSubscription.General 
                    | EventSubscription.Inputs
                    | EventSubscription.Outputs
                    | EventSubscription.Scenes
                    | EventSubscription.SceneItems
            }).catch(async () => {
                return await dispatch("RECONNECT");
            });

            if (connected) {
                state.obs = obs;
                return await dispatch("LISTEN");
            }

            return false;
        },

        LISTEN: async ({ dispatch, state, rootState }) => {
            const scene = await dispatch("SEND", { event: "GetCurrentProgramScene" });
            state.scene = { sceneName: scene.currentProgramSceneName };

            const inputNames = await dispatch("devices/GET");
            await dispatch("devices/LISTEN", inputNames);

            dispatch("RESTORE_STATE");

            state.obs.once("ExitStarted", async () => {
                return await dispatch("RECONNECT");
            });

            state.obs.on("StreamStateChanged", data => {
                state.status.stream = data.outputActive;
                
                state.status.stream
                    ? dispatch("events/ON_STREAM_STARTING")
                    : dispatch("events/ON_STREAM_STOPPING");

                return state.status.stream;
            });

            state.obs.on("RecordStateChanged", data => {
                state.status.record = data.outputActive;
                
                state.status.record
                    ? dispatch("events/ON_RECORDING_STARTED")
                    : dispatch("events/ON_RECORDING_STOPPING");

                return state.status.record;
            });

            state.obs.on("SceneItemEnableStateChanged", async scene => {
                if (scene.sceneName === state.scene.sceneName) {
                    const { sceneItems } = await dispatch("SEND", {
                        event: "GetSceneItemList",
                        args: state.scene
                    });

                    const source = sceneItems.find(source => {
                        return source.sceneItemId === scene.sceneItemId;
                    });

                    if (rootState.config.obs.camera.includes(source.sourceName)) {
                        state.devices.list.camera = scene.sceneItemEnabled;
                    }
                }
            });

            state.obs.on("CurrentProgramSceneChanged", async scene => {
                state.scene = scene;
                state.devices.list.camera = await dispatch("devices/GET_CAMERA_VISIBLE");
            });

            dispatch("SETUP_CHECKING_INTERVAL");
            return true;
        },

        RECONNECT: async ({ dispatch, state, rootState }) => {
            if (state.obs.socket) {
                await dispatch("DISCONNECT");
            }

            if (rootState.config.obs.autoreconnect) {
                await Promise.delay(3000);
                dispatch("CONNECT");
            }

            return false;
        },

        DISCONNECT: ({ dispatch, state }) => {
            state.obs = { socket: undefined };
            state.status.tech.fps = 0;
            state.status.videoSettings = null;

            dispatch("STOP_CHECKING_INTERVAL");
            return true;
        },

        SEND: async ({ state }, { event, args }) => {
            if (!state.obs.socket) {
                return {};
            }

            return await state.obs.call(event, args)
                .catch(() => ({}));
        },

        CHECK_STATS: async ({ dispatch, state, rootState }) => {
            if (!state.status.videoSettings) {
                state.videoSettings = await dispatch("SEND", { event: "GetVideoSettings" });
            }

            const stats = await dispatch("SEND", { event: "GetStats" });
            state.status.tech.fps = Math.floor(stats.activeFps);

            if (rootState.settings.settings.notifications.lowfps) {
                if (state.status.tech.fps < state.videoSettings.fpsNumerator && !rootState.notifications.lowfps) {
                    dispatch("notifications/TURN_LOWFPS", true, { root: true });
                } else if (rootState.notifications.lowfps) {
                    dispatch("notifications/TURN_LOWFPS", false, { root: true });
                }
            }

            return state.status.tech;
        },

        RESTORE_STATE: async ({ dispatch, state }) => {
            const [stream, record] = await Promise.all([
                dispatch("SEND", { event: "GetStreamStatus" }),
                dispatch("SEND", { event: "GetRecordStatus" })
            ]);

            state.status.stream = stream.outputActive;
            state.status.record = record.outputActive;

            if (state.status.stream || state.status.record) {
                const timecode = state.status.stream 
                    ? stream.outputTimecode 
                    : record.outputTimecode;
    
                dispatch("time/SET", timecode);
                dispatch("time/SETUP");
            }

            return state.status.stream || state.status.record;
        },

        UPDATE_SCENE: async ({ dispatch, state }) => {
            const scene = await dispatch("SEND", { event: "GetCurrentScene" });
            state.scene = { name: scene.name };
            return scene;
        },

        SETUP_CHECKING_INTERVAL: ({ dispatch }) => {
            dispatch("CHECK_STATS");
            interval = setInterval(() => dispatch("CHECK_STATS"), 1000);
        },

        STOP_CHECKING_INTERVAL: () => {
            clearInterval(interval);
            interval = null;
        }
    },

    modules: {
        events,
        devices,
        time
    }
};