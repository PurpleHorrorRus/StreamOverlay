import Promise from "bluebird";
import OBSWebSocket from "obs-websocket-js";

let interval = null;
let updateInterval = null;

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
        status: {
            stream: false,
            record: false,
            time: {
                seconds: 0,
                mins: 0,
                hours: 0
            },
            videoSettings: null,
            tech: null,
            bitrate: 2300
        },
        devices: {
            mic: false,
            sound: false,
            camera: null
        }
    }),
    actions: {
        CONNECT: async ({ dispatch, state }, data) => {
            if (state.obs._connected) {
                return;
            }

            state.obs = new OBSWebSocket({
                address: `${data.address}:${data.port}`
            });
            
            state.obs.connect()
                .then(() => dispatch("LISTEN", data))
                .catch(async () => {
                    await Promise.delay(1000);
                    return await dispatch("CONNECT", data);
                });
        },
        LISTEN: async ({ dispatch, state, rootState }, data) => {
            const status = await dispatch("SEND", { event: "GetStreamingStatus" });
            state.status.stream = status.streaming;
            state.status.record = status.record;

            if (status.streaming || status.record) {
                dispatch("SETUP_UPDATE_INTERVAL");
            }

            if (status.streaming) state.status.time = setTime(status["stream-timecode"]);
            else if (status.record) state.status.time = setTime(status["rec-timecode"]);

            state.obs.once("ConnectionClosed", async () => {
                await dispatch("DISCONNECT");
                await dispatch("CONNECT", data);
            });

            state.obs.on("StreamStarting", () => {
                state.status.stream = true;

                if (!state.status.record) {
                    dispatch("SETUP_UPDATE_INTERVAL");
                }
            });

            state.obs.on("StreamStopping", () => {
                state.status.stream = false;

                dispatch("notifications/TURN", { name: "lowbitrate", show: false }, { root: true });
                dispatch("notifications/TURN", { name: "lowfps", show: false }, { root: true });

                if (!state.status.record) {
                    dispatch("CLEAR_UPDATE_INTERVAL");
                }
            });

            state.obs.on("RecordingStarted", () => {
                state.status.record = true;
                if (!state.status.stream) {
                    dispatch("SETUP_UPDATE_INTERVAL");
                }
            });

            state.obs.on("RecordingStopping", () => {
                state.status.record = false;
                if (!state.status.stream) {
                    dispatch("CLEAR_UPDATE_INTERVAL");
                }
            });

            state.obs.on("StreamStatus", ({ kbitsPerSec }) => {
                state.status.bitrate = kbitsPerSec;

                if (rootState.settings.settings.notifications.lowbitrate) {
                    if (kbitsPerSec <= 200) {
                        dispatch("notifications/TURN_LOWBITRATE", true, { root: true });
                    } else if (rootState.notifications.lowbitrate) {
                        dispatch("notifications/TURN_LOWBITRATE", false, { root: true });
                    }
                }
            });

            const sources = await dispatch("SEND", { event: "GetSpecialSources" });
            state.devices = {
                mic: !(await dispatch("GET_MUTED", sources["mic-1"])),
                sound: !(await dispatch("GET_MUTED", sources["desktop-1"])),
                camera: await dispatch("GET_CAMERA_VISIBLE")
            };

            state.obs.on("SourceMuteStateChanged", ({ sourceName, muted }) => {
                switch (sourceName) {
                    case sources["mic-1"]: {
                        state.devices.mic = !muted;
                        break;
                    }
                    case sources["desktop-1"]: {
                        state.devices.sound = !muted;
                        break;
                    }
                }
            });

            let { name: currentScene } = await dispatch("SEND", { event: "GetCurrentScene" });
            state.obs.on("SceneItemVisibilityChanged", ({ sceneName, itemName, itemVisible }) => {
                if (sceneName === currentScene && ~rootState.config.OBS.camera.indexOf(itemName)) {
                    state.devices.camera = itemVisible;
                }
            });

            state.obs.on("SwitchScenes", async ({ sceneName }) => {
                currentScene = sceneName;
                state.devices.camera = await dispatch("GET_CAMERA_VISIBLE");
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
        GET_MUTED: async ({ dispatch }, source) => {
            const { muted } = await dispatch("SEND", {
                event: "GetMute",
                args: { source }
            });

            return muted;
        },
        GET_VISIBLE: async ({ dispatch }, item) => {
            return new Promise(resolve => {
                dispatch("SEND", {
                    event: "GetSceneItemProperties",
                    args: { item }
                }).then(({ visible }) => resolve(visible))
                    .catch(() => resolve(null));
            });
        },
        GET_CAMERA_VISIBLE: async ({ dispatch, rootState }) => {
            const mapped = await Promise.map(
                rootState.config.OBS.camera,
                async item => await dispatch("GET_VISIBLE", item)
            );

            const valid = mapped.filter(m => m !== null);
            return valid.length > 0 ? valid.indexOf(true) !== -1 : null;
        },
        CHECK_STATS: async ({ dispatch, state, rootState }) => {
            if (!state.status.videoSettings) {
                state.status.videoSettings = await dispatch("SEND", { event: "GetVideoInfo" });   
            }

            const { stats } = await dispatch("SEND", { event: "GetStats" });
            if (rootState.settings.settings.OBSStatus.enable) {
                state.status.tech = stats;
            }

            if (rootState.settings.settings.notifications.lowfps) {
                if (stats.fps < state.status.videoSettings.fps) {
                    if (!rootState.notifications.lowfps) {
                        dispatch("notifications/TURN_LOWFPS", true, { root: true });
                    }
                } else if (rootState.notifications.lowfps) {
                    dispatch("notifications/TURN_LOWFPS", false, { root: true });
                }
            }
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
        },
        SETUP_UPDATE_INTERVAL: ({ dispatch }) => {
            if (updateInterval) {
                dispatch("CLEAR_UPDATE_INTERVAL");
            }

            updateInterval = setInterval(() => dispatch("UPDATE_TIME"), 1000);
        },
        CLEAR_UPDATE_INTERVAL: ({ state }) => {
            state.status.time.seconds = 0;
            state.status.time.mins = 0;
            state.status.time.hours = undefined;

            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        },
        UPDATE_TIME: ({ state }) => {
            state.status.time.seconds++;

            if (state.status.time.seconds >= 60) {
                state.status.time.seconds = 0;
                state.status.time.mins++;
            }

            if (state.status.time.mins >= 60) {
                if (state.status.time.hours === undefined) state.status.time.hours = 1;
                else state.status.time.hours++;

                state.status.time.seconds = 0;
                state.status.time.mins = 0;
            }
        }
    }
};