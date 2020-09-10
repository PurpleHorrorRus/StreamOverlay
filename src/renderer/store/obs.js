import Promise from "bluebird";
import socket from "obs-websocket-js";
import misc from "~/plugins/misc";

export default {
    namespaced: true,
    state: () => ({
        obs: { _connected: false },
        interval: null,
        updateInterval: null,
        status: {
            stream: false,
            recording: false,
            time: {
                seconds: 0,
                mins: 0,
                hours: 0
            },
            bitrate: 2300,
            fps: 60,
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

            const sleep = timeout => {
                return new Promise(resolve => {
                    setTimeout(resolve, timeout);
                });
            };

            const awaitConnection = (timeout = 4 * 1000) => {
                return new Promise(async resolve => {
                    while (!await connect()) {
                        await sleep(timeout);
                    }

                    console.log("OBS Connected");
                    return resolve(true);
                });
            };

            const muted = source => {
                return new Promise((resolve, reject) => {
                    send("GetMute", { source })
                        .then(({ muted }) => resolve(muted))
                        .catch(reject);
                });
            };

            const getVisible = item => {
                return new Promise(resolve => {
                    send("GetSceneItemProperties", { item })
                        .then(({ visible }) => resolve(visible))
                        .catch(() => resolve(null));
                });
            };

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

                    let visible = this.getters["notifications/getLowBitrate"];
                    if (state.status.bitrate <= 200) {
                        if (!visible) {
                            this.dispatch("notifications/turnLowBitrate", true);
                        }
                    } else {
                        if (visible) {
                            this.dispatch("notifications/turnLowBitrate", false);
                        }
                    }

                    state.status.fps = data.fps;
                    visible = this.getters["notifications/getLowFPS"];
                    if (state.status.fps <= 40) {
                        if (!visible) {
                            this.dispatch("notifications/turnLowFPS", true);
                        }
                    } else {
                        if (visible) {
                            this.dispatch("notifications/turnLowFPS", false);
                        }
                    }

                    state.status.droppedFPS = data["num-dropped-frames"];
                    state.status.totalFPS = data["num-total-frames"];
                    state.status.strain = data.strain;
                });

                const sources = await send("GetSpecialSources");

                state.interval = setInterval(async () => {
                    state.devices = {
                        mic: !await muted(sources["mic-1"]).catch(handleError),
                        sound: !await muted(sources["desktop-1"]).catch(handleError),
                        camera: await getVisible(data.camera)
                    };
                }, 800);
            };

            const send = (...args) => {
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

                if (state.interval) {
                    clearInterval(state.interval);
                    state.interval = null;
                }
                
                state.obs = { _connected: false };
                state.obs._connected = await awaitConnection();
                startStatusChecking();
                return;
            };

            state.obs._connected = await awaitConnection();
            startStatusChecking();

            state.obs.on("error", handleError);
        },
        setDevices(state, devices) { return state.devices = devices; },
        setupUpdateInterval(state) {
            if (state.updateInterval) {
                this.dispatch("obs/clearUpdateInterval");
            }

            state.updateInterval = setInterval(() => this.dispatch("obs/updateTime"), 1000);
        },
        clearUpdateInterval(state) {
            state.status.time.seconds = 0;
            state.status.time.mins = 0;
            state.status.time.hours = 0;
            if (state.updateInterval) {
                clearInterval(state.updateInterval);
                state.updateInterval = null;
            }
        },
        updateTime(state) {
            if (state.status.stream || state.status.recording) {
                state.status.time.seconds++;
                if (state.status.time.seconds >= 60) {
                    state.status.time.seconds = 0;
                    state.status.time.mins++;
                    this.dispatch("timers/addTime", 1);
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
        connectOBS ({ commit }, data) { 
            commit("connectOBS", data); 
        },
        setDevices({ commit }, devices) { 
            commit("setDevices", devices); 
        },
        setupUpdateInterval({ commit }) { 
            commit("setupUpdateInterval"); 
        },
        clearUpdateInterval({ commit }) { 
            commit("clearUpdateInterval"); 
        },
        updateTime({ commit }) { 
            commit("updateTime"); 
        }
    },
    getters: {
        getOBS(state) { 
            return state.obs; 
        },
        getStatus(state) { 
            return state.status; 
        },
        getDevices(state) { 
            return state.devices; 
        }
    }
};