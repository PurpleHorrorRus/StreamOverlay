import misc from "~/plugins/misc";

const globalURL = "https://api.frankerfacez.com/v1/set/global";

const format = set => {
    return set.emoticons.map(emote => ({
        code: emote.name,
        url: "https:" + Object.values(emote.urls).pop()
    }));
};

const formatSets = sets => {
    return sets.map(format);
};

export default {
    namespaced: true,

    state: () => ({
        emotes: []
    }),

    actions: {
        GLOBAL: async () => {
            const response = await misc.syncRequest(globalURL);
            const values = Object.values(response.sets);
            const emotes = formatSets(values);
            return emotes.flat(1);
        },

        CHANNEL: async (_, username) => {
            username = username.toLowerCase();

            const response = await misc.syncRequest(`https://api.frankerfacez.com/v1/room/${username}`);
            return response.room
                ? format(response.sets[response.room.set])
                : [];
        }
    }
};