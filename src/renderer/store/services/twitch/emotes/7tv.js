import SevenTV from "7tv";

const SevenTVClient = SevenTV();

export default {
    namespaced: true,

    state: () => ({
        emotes: []
    }),

    actions: {
        CHANNEL: async ({ rootState }) => {
            const emotes = await SevenTVClient.fetchUserEmotes(rootState.service.user.login)
                .catch(() => ([]));

            return emotes.map(emote => ({
                name: emote.name,
                url: `https://cdn.7tv.app/emote/${emote.id}/1x.webp`
            }));
        }
    }
};