import { throttle } from "lodash";
import Promise from "bluebird";
import OBSWebSocket, { EventSubscription } from "obs-websocket-js";

import events from "~/store/obs/events";
import devices from "~/store/obs/devices";
import time from "~/store/obs/time";

let interval = null;

const BITRATE_UPDATE_SECONDS = 2;
let bitrateUpdateSeconds = 0;

export default {
    namespaced: true,

    state: () => ({
        obs: { socket: undefined },
        videoSettings: null,
        scene: null,

        meters: {
            mic: {
                volume: 0,
                init: false,
                throttle: () => (false)
            }
        },

        status: {
            stream: false,
            record: false,

            tech: {
                bitrate: 0,
                lastBytes: 0,
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
                    | EventSubscription.InputVolumeMeters
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

            await dispatch("devices/LISTEN");
            await dispatch("RESTORE_STATE");

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
                if (scene.sceneName !== state.scene.sceneName) {
                    return false;
                }

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
            });

            state.obs.on("CurrentProgramSceneChanged", async scene => {
                state.scene = scene;
                state.devices.list.camera = await dispatch("devices/GET_CAMERA_VISIBLE");
            });

            state.obs.on("InputVolumeMeters", data => {
                if (!state.meters.mic.init) {
                    state.meters.mic.throttle = throttle(inputs => {
                        const mul = inputs.find(input => {
                            return input.inputName === state.devices.sources.mic;
                        }).inputLevelsMul[0][2];

                        state.meters.mic.volume = Math.max(20 * Math.log10(mul), -80);
                    }, rootState.config.obs.meters.mic.timeout);

                    state.meters.mic.init = true;
                }

                state.meters.mic.throttle(data.inputs);
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
            state.videoSettings = null;

            state.status.tech.fps = 0;
            state.status.tech.bitrate = 0;

            state.meters.mic.volume = 0;
            state.meters.mic.init = false;
            state.meters.mic.throttle = () => (false);

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
            if (state.status.stream && ++bitrateUpdateSeconds === BITRATE_UPDATE_SECONDS) {
                dispatch("SEND", { event: "GetStreamStatus" }).then(status => {
                    const difference = status.outputBytes - state.status.tech.lastBytes;
                    const kbitPerSec = (difference * 8) / 2000;
                    state.status.tech.bitrate = Math.ceil(kbitPerSec);
                    state.status.tech.lastBytes = status.outputBytes;

                    if (rootState.config.settings.notifications.lowbitrate && state.status.tech.bitrate >= 0) {
                        dispatch("notifications/TURN_LOWBITRATE", state.status.tech.bitrate < 2000, { root: true });
                    }

                    bitrateUpdateSeconds = 0;
                });
            }

            if (!state.videoSettings) {
                state.videoSettings = await dispatch("SEND", { event: "GetVideoSettings" });
            }

            const stats = await dispatch("SEND", { event: "GetStats" });
            state.status.tech.fps = Math.floor(stats.activeFps);

            if (rootState.config.settings.notifications.lowfps) {
                dispatch(
                    "notifications/TURN_LOWFPS",
                    state.status.tech.fps < state.videoSettings.fpsNumerator,
                    { root: true }
                );
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