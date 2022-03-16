import misc from "~/plugins/misc";

const globalURL = "https://api.frankerfacez.com/v1/set/global";

const format = set => {
    return set.emoticons.map(emote => {
        const urls = Object.values(emote.urls);
        const lastEmote = urls[urls.length - 1];

        return {
            code: emote.name,
            url: "https:" + lastEmote
        };
    });
};

const formatSets = sets => {
    return sets.map(format);
};

export default {
    namespaced: true,
    state: () => ({}),
    actions: {
        GLOBAL: async () => {
            const res = await misc.syncRequest(globalURL);
            const values = Object.values(res.sets);
            const emotes = formatSets(values);
            return emotes.flat(1);
        },

        CHANNEL: async (_, username) => {
            const res = await misc.syncRequest(`https://api.frankerfacez.com/v1/room/${username.toLowerCase()}`);
            return res.room
                ? format(res.sets[res.room.set])
                : [];
        }
    }
};