import misc from "~/plugins/misc";

const config = {
    visibleMessagesMax: 15
};

const emptyStream = {
    title: "",
    game: ""
};

let utterQuery = [];
let utter = null;
// eslint-disable-next-line no-undef
if (process.client) {
    utter = new SpeechSynthesisUtterance();
    utter.lang = "ru-RU";
    utter.onend = async () => {
        utterQuery.splice(0, 1);
        if (utterQuery.length > 0) {
            utter.text = utterQuery[0];
            await new Promise(resolve => setTimeout(resolve, 500));
            speechSynthesis.speak(utter);
        }
    };
}

export default {
    namespaced: true,

    state: () => ({
        client: null,
        chat: null,
        user: null,
        connected: false,

        messages: [],
        stream: emptyStream
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

            if (!message.system) {
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

        ADD_SYSTEM_MESSAGE: async ({ dispatch }, text) => {
            dispatch("ADD_MESSAGE", {
                id: Date.now(),
                nickname: "SYSTEM",
                formatted: [{
                    type: "text",
                    content: text
                }],
                time: await dispatch("twitch/FORMAT_MESSAGE_TIME", null, { root: true }),
                system: true
            });
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

        VOICE_MESSAGE: ({ rootState }, { name, message, forceName }) => {
            const readName = rootState.settings.settings.chat.tts.readName || forceName;
            utter.text = readName ? `${name} сказал ${message}` : message;
            utterQuery.push(utter.text);

            if (utterQuery.length === 1) {
                speechSynthesis.speak(utter);
            }
        },

        UPDATE_RECENT: ({ dispatch, rootState }, data) => {
            data = { ...data };
            let recent = [...rootState.config.recent];

            const index = recent.findIndex(item => {
                return item.title === data.title && item.game === data.game;
            });

            recent = ~index ? misc.arrayMove(recent, index, 0) : [data, ...recent];

            if (recent.length > 5) {
                recent = recent.splice(0, 5);
            }

            dispatch("settings/SAVE", {
                type: "recent",
                content: recent
            },{ root: true });
        }
    }
};