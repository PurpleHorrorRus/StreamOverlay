import bttv from "./emotes/bttv";
import ffz from "./emotes/ffz";

export default {
    namespaced: true,

    state: () => ({}),

    actions: {
        LOAD: async ({ dispatch, state }, { id, name }) => {
            const [bGlobal, bChannel, fGlobal, fChannel] = await Promise.all([
                dispatch("bttv/GLOBAL"),
                dispatch("bttv/CHANNEL", id),
                dispatch("ffz/GLOBAL"),
                dispatch("ffz/CHANNEL", name)
            ]);

            state.bttv.emotes = bGlobal.concat(bChannel);
            state.ffz.emotes = fGlobal.concat(fChannel);

            return true;
        },

        FORMAT_TWITCH_EMOTES: (_, emotes) => {
            return emotes.map(emote => {
                return emote.positions.map(() => ({
                    url: `http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/3.0`,
                    code: emote.code
                }));
            }).flat(2);
        },

        FIND: ({ state }, word) => {
            return state.bttv.emotes.find(e => e.code === word)
                || state.ffz.emotes.find(e => e.code === word);
        }
    },

    modules: {
        bttv,
        ffz
    }
};