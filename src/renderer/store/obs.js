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
            bitrate: 2300,
            droppedFPS: 0,
            totalFPS: 0,
            strain: 0
        },
        devices: {
            mic: false,
            sound: false,
            camera: null
        }
    }),
    mutations: {
        async connectOBS (state, data) {
            if (state.obs._connected) {
                return;
            }

            const connect = () => {
                return new Promise(resolve => {
                    state.obs = new socket({ 
                        address: `${data.address}:${data.port}`
                    });

                    state.obs.connect()
                        .then(() => resolve(true))
                        .catch(() => resolve(false));
                });
            };

            const awaitConnection = (timeout = 4 * 1000) => {
                return new Promise(async resolve => {
                    let connected = await connect();

                    while (!connected) {
                        await Promise.delay(timeout);
                        connected = await connect();
                    }

                    console.log("OBS Connected");
                    return resolve(true);
                });
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
                const _data = await send("GetStreamingStatus").catch(handleError);
                const { streaming, recording } = _data;

                state.status.stream = streaming;
                state.status.recording = recording;

                if (_data.streaming || _data.recording) {
                    this.dispatch("obs/setupUpdateInterval");
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
                
                if (streaming) {
                    setTime(_data["stream-timecode"]);
                } else if (recording) {
                    setTime(_data["rec-timecode"]);
                }
 
                state.obs.on("StreamStarting", async () => {
                    state.status.stream = true;

                    if (!state.status.recording) { 
                        this.dispatch("obs/setupUpdateInterval");
                    }
                });

                state.obs.on("StreamStopping", () => {
                    state.status.stream = false;
                    
                    this.dispatch("notifications/turnLowBitrate", false);
                    this.dispatch("notifications/turnLowFPS", false);
                    if (!state.status.recording) {
                        this.dispatch("obs/clearUpdateInterval");
                    }
                });

                state.obs.on("RecordingStarted", () => {
                    state.status.recording = true;
                    if (!state.status.stream) {
                        this.dispatch("obs/setupUpdateInterval");
                    }
                });

                state.obs.on("RecordingStopping", () => {
                    state.status.recording = false;
                    if (!state.status.stream) {
                        this.dispatch("obs/clearUpdateInterval");
                    }
                });

                state.obs.on("StreamStatus", data => {
                    state.status.bitrate = data["kbits-per-sec"];

                    if (state.status.bitrate <= 200) {
                        if (!this.state.notifications.lowbitrate) {
                            this.dispatch("notifications/turnLowBitrate", true);
                        }
                    } else {
                        if (this.state.notifications.lowbitrate) {
                            this.dispatch("notifications/turnLowBitrate", false);
                        }
                    }

                    state.status.droppedFPS = data["num-dropped-frames"];
                    state.status.totalFPS = data["num-total-frames"];
                    state.status.strain = data.strain;
                });

                const sources = await send("GetSpecialSources");
                const devices = await Promise.all([
                    muted(sources["mic-1"]).catch(handleError),
                    muted(sources["desktop-1"]).catch(handleError),
                    getVisible(this.state.config.OBS.camera).catch(handleError),
                ]).catch(handleError);

                state.devices = {
                    mic: !devices[0],
                    sound: !devices[1],
                    camera: devices[2]
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
                    default: {
                        break;
                    }
                    }
                });

                state.obs.on("SceneItemVisibilityChanged", ({ itemName, itemVisible }) => {
                    if (itemName === this.state.config.OBS.camera) {
                        state.devices.camera = itemVisible;
                    }
                });
                
                state.obs.on("SwitchScenes", 
                    async () => state.devices.camera = await getVisible(this.state.config.OBS.camera));

                const checkFPS = () => {
                    if (!this.state.notifications.lowfps) {
                        if (state.status.tech.fps < state.status.videoSettings.fps) {
                            this.dispatch("notifications/turnLowFPS", true);
                        }
                    } else {
                        if (state.status.tech.fps >= state.status.videoSettings.fps) {
                            this.dispatch("notifications/turnLowFPS", false);
                        }
                    }
                };

                const check = async () => {
                    if (state.obs._connected) {
                        const video = await send("GetVideoInfo");
                        state.status.videoSettings = video;

                        const { stats } = await send("GetStats");
                        state.status.tech = stats;
                        checkFPS();
                    }
                };

                check();
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

            const handleError = async e => {
                console.error(e);

                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                
                state.status.tech = null;
                state.status.videoSettings = null;
                state.obs = { _connected: false };

                state.obs._connected = await awaitConnection();

                startStatusChecking();
                return;
            };

            state.obs._connected = await awaitConnection();
            startStatusChecking();

            state.obs.on("error", handleError);
        },
        setDevices (state, devices) { 
            state.devices = devices; 
        },
        setupUpdateInterval (state) {
            if (updateInterval) {
                this.dispatch("obs/clearUpdateInterval");
            }

            updateInterval = setInterval(() => this.dispatch("obs/updateTime"), 1000);
        },
        clearUpdateInterval (state) {
            state.status.time.seconds = 0;
            state.status.time.mins = 0;
            state.status.time.hours = 0;
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        },
        updateTime (state) {
            if (state.status.stream || state.status.recording) {
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
    },
    actions: {
        connectOBS: ({ commit }, data) => commit("connectOBS", data),
        setDevices: ({ commit }, devices) => commit("setDevices", devices),
        setupUpdateInterval: ({ commit }) => commit("setupUpdateInterval"),
        clearUpdateInterval: ({ commit }) => commit("clearUpdateInterval"),
        updateTime: ({ commit }) => commit("updateTime")
    }
};