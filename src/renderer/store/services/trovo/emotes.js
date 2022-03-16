const findInCollection = (name, collection) => {
    return collection.find(emote => emote.name === name);
};

export default {
    namespaced: true,
    stats: () => ({
        collections: []
    }),
    actions: {
        LOAD: async ({ state, rootState }) => {
            const emotes = await rootState.service.client.channel.emotes(0, [rootState.service.user.id]);
            state.collections = emotes.channels;
            return state.collections;
        },

        FIND_EMOTE: ({ state }, name) => {
            return findInCollection(name, state.collections.globalEmotes)
                || findInCollection(name, state.collections.eventEmotes)
                || findInCollection(name, state.collections.customizedEmotes.channel);
        }
    }
};