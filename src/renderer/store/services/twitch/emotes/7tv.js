import SevenTV from "7tv";
import misc from "~/plugins/misc";

const SevenTVClient = SevenTV();

export default {
    namespaced: true,

    state: () => ({
        emotes: []
    }),

    actions: {
        GLOBAL: async () => {
            const response = await misc.syncRequest("https://7tv.io/v3/emote-sets/62cdd34e72a832540de95857");
            return response?.emotes.map(emote => ({
                name: emote.name,
                url: `https:${emote.data.host.url}/${emote.data.host.files[0].name}`
            })) || [];
        },

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