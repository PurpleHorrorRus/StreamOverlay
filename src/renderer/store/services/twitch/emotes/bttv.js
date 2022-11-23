import misc from "~/plugins/misc";

const globalURL = "https://api.betterttv.net/3/cached/emotes/global";

const format = emotes => {
    return emotes.map(emote => ({
        code: emote.code,
        url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
    }));
};

export default {
    namespaced: true,

    state: () => ({
        emotes: []
    }),

    actions: {
        GLOBAL: async () => {
            const response = await misc.syncRequest(globalURL);
            return format(response);
        },

        CHANNEL: async (_, id) => {
            const response = await misc.syncRequest(`https://api.betterttv.net/3/cached/users/twitch/${id}`);
            return response.sharedEmotes
                ? format(response.sharedEmotes)
                : [];
        }
    }
};