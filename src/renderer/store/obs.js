import Promise from "bluebird";
import OBSWebSocket from "obs-websocket-js";

import events from "~/store/obs/events";
import devices from "~/store/obs/devices";
import time from "~/store/obs/time";

let interval = null;

const setTime = timecode => {
    const [hours, mins, seconds] = timecode.split(":");
    return {
        hours: Number(hours) > 0 ? Number(hours) : undefined,
        mins: Number(mins),
        seconds: parseInt(seconds)
    };
};

export default {
    namespaced: true,

    state: () => ({
        obs: { _connected: false },
        videoSettings: null,
        scene: null,
        status: {
            stream: false,
            record: false,

            tech: null,
            bitrate: 0
        }
    }),

    actions: {
        CONNECT: ({ dispatch, state, rootState }) => {
            if (state.obs._connected) {
                return false;
            }

            const credits = rootState.config.obs;
            state.obs = new OBSWebSocket({
                address: `${credits.address}:${credits.port}`
            });

            state.obs.connect().then(async () => {
                await dispatch("RESTORE_STATE");
                dispatch("LISTEN");
            }).catch(async () => {
                await Promise.delay(1000);
                return await dispatch("CONNECT");
            });
        },

        LISTEN: async ({ dispatch, state, rootState }) => {
            state.obs.once("ConnectionClosed", async () => {
                await dispatch("DISCONNECT");
                await dispatch("CONNECT");
            });

            state.obs.on("StreamStarting", () => {
                state.status.stream = true;
                dispatch("events/ON_STREAM_STARTING");
            });

            state.obs.on("StreamStopping", () => {
                state.status.stream = false;
                dispatch("events/ON_STREAM_STOPPING");
            });

            state.obs.on("RecordingStarted", () => {
                state.status.record = true;
                dispatch("events/ON_RECORDING_STARTED");
            });

            state.obs.on("RecordingStopping", () => {
                state.status.record = false;
                dispatch("events/ON_RECORDING_STOPPING");
            });

            state.obs.on("StreamStatus", status => {
                state.status.bitrate = status.kbitsPerSec;
                dispatch("events/ON_STREAM_STATUS", status);
            });

            await dispatch("devices/GET");
            state.obs.on("SourceMuteStateChanged", source => {
                dispatch("devices/ON_SOURCE_MUTE_STATE_CHANGED", source);
            });

            await dispatch("UPDATE_SCENE");
            state.obs.on("SwitchScenes", () => {
                dispatch("UPDATE_SCENE");
                dispatch("devices/UPDATE_CAMERA");
            });

            state.obs.on("SceneItemVisibilityChanged", item => {
                const sameScene = item.sceneName === state.scene.name;
                const sourceIsCamera = Boolean(~rootState.config.obs.camera.indexOf(item.itemName));

                if (sameScene && sourceIsCamera) {
                    dispatch("devices/UPDATE_CAMERA");
                }
            });

            dispatch("SETUP_CHECKING_INTERVAL");
        },

        DISCONNECT: ({ state }) => {
            state.obs = { _connected: false };
            state.status.tech = null;
            state.status.videoSettings = null;

            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        },

        SEND: async ({ state }, { event, args }) => {
            if (state.obs._connected) {
                return await state.obs.send(event, args).catch(e => {
                    throw e;
                });
            }

            return;
        },

        CHECK_STATS: async ({ dispatch, state, rootState }) => {
            if (!state.videoSettings) {
                state.videoSettings = await dispatch("SEND", { 
                    event: "GetVideoInfo"
                });   
            }

            const { stats } = await dispatch("SEND", { event: "GetStats" });
            if (rootState.settings.settings.OBSStatus.enable) {
                state.status.tech = stats;
            }

            if (rootState.settings.settings.notifications.lowfps) {
                if (stats.fps < state.videoSettings.fps) {
                    if (!rootState.notifications.lowfps) {
                        dispatch("notifications/TURN_LOWFPS", true, { root: true });
                    }
                } else if (rootState.notifications.lowfps) {
                    dispatch("notifications/TURN_LOWFPS", false, { root: true });
                }
            }
        },

        RESTORE_STATE: async ({ dispatch, state }) => {
            const status = await dispatch("SEND", { event: "GetStreamingStatus" });
            state.status.stream = status.streaming;
            state.status.record = status.recording;

            if (status.streaming || status.recording) {
                state.time = setTime(status["stream-timecode"] || status["rec-timecode"]);
                dispatch("time/SETUP");
            }
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
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }
    },
    
    modules: {
        events,
        devices,
        time
    }
};