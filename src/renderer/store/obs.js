import Promise from "bluebird";
import socket from "obs-websocket-js";

let interval = null;
let updateInterval = null;

export default {
    namespaced: true,
    state: () => ({
        obs: { _connected: false },
        status: {
            stream: false,
            recording: false,
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
        CONNECT: async ({ dispatch, state, rootState }, data) => {
            if (state.obs._connected) {
                return;
            }

            const connect = () => new Promise(resolve => {
                state.obs = new socket({ 
                    address: `${data.address}:${data.port}`
                });

                state.obs.connect()
                    .then(() => resolve(true))
                    .catch(() => resolve(false));
            });

            const awaitConnection = async (timeout = 4 * 1000) => {
                let connected = await connect();
                
                while (!connected) {
                    await Promise.delay(timeout);
                    connected = await connect();
                }

                console.log("OBS Connected");
                return true;
            };

            const disconnect = async () => {
                state.obs = { _connected: false };
                state.status.tech = null;
                state.status.videoSettings = null;

                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }

                await Promise.delay(1000);
                state.obs._connected = await awaitConnection();
                
                startStatusChecking();
                return;
            };

            const muted = async source => {
                const { muted } = await send("GetMute", { source });
                return muted;
            };

            const getVisible = item => new Promise(resolve => {
                send("GetSceneItemProperties", { item })
                    .then(({ visible }) => resolve(visible))
                    .catch(() => resolve(null));
            });

            const startStatusChecking = async () => {
                const data = await send("GetStreamingStatus");

                state.status.stream = data.streaming;
                state.status.recording = data.recording;

                if (data.streaming || data.recording) {
                    dispatch("SETUP_UPDATE_INTERVAL");
                }

                const setTime = timecode => {
                    if (timecode) {
                        const [hours, mins, seconds] = timecode.split(":");
                        state.status.time = { 
                            hours: Number(hours), 
                            mins: Number(mins), 
                            seconds: parseInt(seconds) 
                        };
                    }
                };
                
                if (data.streaming) {
                    setTime(data["stream-timecode"]);
                } else if (data.recording) {
                    setTime(data["rec-timecode"]);
                }

                state.obs.on("ConnectionClosed", disconnect);
 
                state.obs.on("StreamStarting", async () => {
                    state.status.stream = true;

                    if (!state.status.recording) { 
                        dispatch("SETUP_UPDATE_INTERVAL");
                    }
                });

                state.obs.on("StreamStopping", () => {
                    state.status.stream = false;

                    dispatch("notifications/TURN", { name: "lowbitrate", show: false }, { root: true });
                    dispatch("notifications/TURN", { name: "lowfps", show: false }, { root: true });
                    
                    if (!state.status.recording) {
                        dispatch("CLEAR_UPDATE_INTERVAL");
                    }
                });

                state.obs.on("RecordingStarted", () => {
                    state.status.recording = true;
                    if (!state.status.stream) {
                        dispatch("SETUP_UPDATE_INTERVAL");
                    }
                });

                state.obs.on("RecordingStopping", async () => {
                    state.status.recording = false;
                    if (!state.status.stream) {
                        dispatch("CLEAR_UPDATE_INTERVAL");
                    }
                });

                state.obs.on("StreamStatus", data => {
                    state.status.bitrate = data.kbitsPerSec;

                    if (data.kbitsPerSec <= 200) {
                        dispatch("notifications/TURN", { name: "lowbitrate", show: true }, { root: true });
                    } else {
                        if (rootState.notifications.lowbitrate) {
                            dispatch("notifications/TURN", { name: "lowbitrate", show: false }, { root: true });
                        }
                    }
                });

                const getCameraVisible = async () => {
                    const mapped = await Promise.map(rootState.config.OBS.camera, getVisible);
                    const valid = mapped.filter(m => m !== null);
                    return valid.length > 0 ? valid.indexOf(true) !== -1 : null;
                };

                const sources = await send("GetSpecialSources");
                state.devices = {
                    mic: !await muted(sources["mic-1"]),
                    sound: !await muted(sources["desktop-1"]),
                    camera: await getCameraVisible()
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

                let { name: currentScene } = await send("GetCurrentScene");
                state.obs.on("SceneItemVisibilityChanged", ({ sceneName, itemName, itemVisible }) => {
                    if (sceneName === currentScene && ~rootState.config.OBS.camera.indexOf(itemName)) {
                        state.devices.camera = itemVisible;
                    }
                });
                
                state.obs.on("SwitchScenes", 
                    async ({ sceneName }) => {
                        currentScene = sceneName;
                        state.devices.camera = await getCameraVisible();
                    });

                const check = async () => {
                    if (state.obs._connected) {
                        state.status.videoSettings = await send("GetVideoInfo");

                        const { stats } = await send("GetStats");
                        if (rootState.settings.settings.OBSStatus.enable) {
                            state.status.tech = stats;
                        }
                        
                        dispatch(
                            "notifications/TURN", { 
                                name: "lowfps", 
                                show: stats.fps < state.status.videoSettings.fps
                            }, { root: true });
                    }
                };
                
                interval = setInterval(check, 1000);
            };

            const send = async (...args) => {
                if (!state.obs._connected) {
                    return;
                }

                return new Promise((resolve, reject) => {
                    state.obs.send(...args)
                        .then(resolve)
                        .catch(reject);
                });
            };

            state.obs._connected = await awaitConnection();
            startStatusChecking();
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
            state.status.time.hours = 0;

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
                state.status.time.seconds = 0;
                state.status.time.mins = 0;
                state.status.time.hours++;
            }
        }
    }
};