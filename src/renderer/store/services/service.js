import fs from "fs-extra";
import path from "path";
import Promise from "bluebird";
import TTS from "stream-gtts";

import misc from "~/plugins/misc";

const config = {
    visibleMessagesMax: 15
};

const emptyStream = {
    title: "",
    game: ""
};

const TTSClient = new TTS("ru");
const TTSQuery = [];

const DownloadTTS = async (text, folder) => {
    const filename = "TTS_" + Math.floor(performance.now()) + ".mp3";
    const filepath = path.join(folder, filename);
    await TTSClient.save(filepath, text);
    return filepath;
};

const ReadTTS = async file => {
    const audio = new Audio(file);
    audio.volume = 0.5;
    audio.play();
    audio.onended = async () => {
        fs.remove(file);
        TTSQuery.splice(0, 1);

        if (TTSQuery.length > 0) {
            await Promise.delay(500);
            return ReadTTS(TTSQuery[0]);
        }
    };
};

export default {
    namespaced: true,

    state: () => ({
        client: null,
        chat: null,
        user: null,
        connected: false,

        messages: [],
        stream: emptyStream,

        viewers: 0,
        followers: 0
    }),

    actions: {
        SET_CLIENT: ({ state }, client) => {
            state.client = client;
            return state.client;
        },

        SET_CHAT: ({ state }, chat) => {
            state.chat = chat;
            return state.chat;
        },

        SET_USER: ({ state }, user) => {
            state.user = user;
            return state.user;
        },

        SET_STREAM: ({ state }, stream) => {
            state.stream = stream;
            return state.stream;
        },

        INIT: async ({ dispatch }) => {
            dispatch("UPDATE_INFO");
            setInterval(() => dispatch("UPDATE_INFO"), 10000);
        },

        UPDATE_INFO: async ({ dispatch, state }) => {
            const [viewers, followers] = await Promise.all([
                dispatch("SERVICE_DISPATCH", "VIEWERS_COUNT", { root: true }),
                dispatch("SERVICE_DISPATCH", "FOLLOWERS_COUNT", { root: true })
            ]);

            state.viewers = viewers;
            state.followers = followers;
        },

        ADD_MESSAGE: async ({ dispatch, state, rootState }, message) => {
            message = Object.assign(message, {
                id: message.id || Date.now(),
                show: true,
                bannded: false
            });

            state.messages.unshift(message);
            dispatch("LIMIT_MESSAGES");

            if (rootState.settings.settings.chat.timeout > 0) {
                setTimeout(() => {
                    dispatch("REMOVE_MESSAGE", message.id);
                }, rootState.settings.settings.chat.timeout * 1000);
            }

            if (!message.system && !message.service && !message.past) {
                if (rootState.settings.settings.chat.sound) {
                    dispatch("PLAY_SOUND");
                }

                if (rootState.settings.settings.chat.tts.enable) {
                    dispatch("VOICE_MESSAGE", {
                        name: message.nickname,
                        message: message.content
                    });
                }
            }

            return message;
        },

        ADD_SYSTEM_MESSAGE: async ({ dispatch }, data) => {
            const isObject = typeof data === "object";

            let message = {
                id: Date.now(),
                nickname: isObject ? data.nickname : "SYSTEM",
                system: true,
                time: data.time || await dispatch("GET_CURRENT_TIME"),

                formatted: [{
                    type: "text",
                    content: isObject ? data.content : data
                }]
            };

            if (isObject) {
                message = Object.assign(message, data);
            }

            return await dispatch("ADD_MESSAGE", message);
        },

        REMOVE_MESSAGE: ({ state }, id) => {
            const message = state.messages.find(message => {
                return message.id === id;
            });

            if (message) message.show = false;
            return Boolean(message);
        },

        LIMIT_MESSAGES: ({ state }) => {
            const visibleMessagesCount = state.messages.filter(m => m.show).length;

            if (visibleMessagesCount > config.visibleMessagesMax) {
                for (let i = config.visibleMessagesMax; i < visibleMessagesCount; i++) {
                    if (!state.messages[i].show) break;
                    state.messages[i].show = false;
                }
            }
        },

        PLAY_SOUND: () => {
            const sound = new Audio("notification.mp3");
            sound.volume = 0.6;
            sound.play();
        },

        VOICE_MESSAGE: async ({ dispatch, rootState }, { name, message, forceName }) => {
            const readName = rootState.settings.settings.chat.tts.readName || forceName;
            const text = readName ? `${name} сказал ${message}` : message;

            const folder = await dispatch("PREPARE_TEMP_FOLDER", "tts", { root: true });
            const file = await DownloadTTS(text, folder);
            TTSQuery.push(file);

            if (TTSQuery.length === 1) {
                return await ReadTTS(TTSQuery[0]);
            }

            return text;
        },

        GET_CURRENT_TIME: () => {
            const time = new Date();
            return misc.formatTime({
                hours: time.getHours(),
                mins: time.getMinutes(),
                seconds: time.getSeconds()
            });
        },

        STREAM_VOICE: async (_, text) => {
            return await TTSClient.stream(text);
        },

        UPDATE_RECENT: ({ dispatch, rootState }, data) => {
            data = { ...data };
            let recent = [...rootState.config.recent];

            const index = recent.findIndex(item => {
                return item.title === data.title && item.game === data.game;
            });

            ~index
                ? misc.arrayMove(recent, index, 0)
                : recent.unshift(data);

            if (recent.length > 5) {
                recent = recent.splice(0, 5);
            }

            dispatch("settings/SAVE_CUSTOM", {
                type: "recent",
                settings: recent
            },{ root: true });

            return true;
        }
    }
};