import bttv from "~/store/services/twitch/emotes/bttv";
import ffz from "~/store/services/twitch/emotes/ffz";

const collection = arr => {
    return {
        content: arr,
        ids: arr.map(e => e.code)
    };
};

export default {
    namespaced: true,

    state: () => ({
        emotes: {
            bttv: [],
            ffz: []
        }
    }),

    actions: {
        LOAD: async ({ dispatch, state }, { id, name }) => {
            const [bGlobal, bChannel, fGlobal, fChannel] = await Promise.all([
                dispatch("bttv/GLOBAL"),
                dispatch("bttv/CHANNEL", id),
                dispatch("ffz/GLOBAL"),
                dispatch("ffz/CHANNEL", name)
            ]);

            state.bttv = collection([...bGlobal, ...bChannel]);
            state.ffz = collection([...fGlobal, ...fChannel]);

            return 0;
        },

        FORMAT_TWITCH_EMOTES: (_, message) => {
            if (!message.emotes) {
                return [];
            }

            const words = Object.values(message.emotes);
            const ids = Object.keys(message.emotes);

            const positions = words.map(([position]) => {
                return position.split("-")
                    .map(Number);
            });

            return positions.map(([start, end], index) => {
                return {
                    url: `http://static-cdn.jtvnw.net/emoticons/v1/${ids[index]}/3.0`,
                    word: message.text.substring(start, end + 1)
                };
            });
        }
    },

    modules: {
        bttv,
        ffz
    }
};