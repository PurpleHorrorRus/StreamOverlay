import misc from "~/plugins/misc";

const globalURL = "https://api.betterttv.net/3/cached/emotes/global";

const format = emotes => {
    return emotes.map(emote => {
        return {
            code: emote.code,
            url: `https://cdn.betterttv.net/emote/${emote.id}/3x`
        };
    });
};

export default {
    namespaced: true,
    state: () => ({}),
    actions: {
        GLOBAL: async () => {
            const res = await misc.syncRequest(globalURL);
            return format(res);
        },

        CHANNEL: async (_, id) => {
            const res = await misc.syncRequest(`https://api.betterttv.net/3/cached/users/twitch/${id}`);
            return res.sharedEmotes
                ? format(res.sharedEmotes)
                : [];
        }
    }
};