import Promise from "bluebird";

export default {
    namespaced: true,

    state: () => ({
        badges: []
    }),

    actions: {
        LOAD: async ({ state, rootState }) => {
            let [global, channel] = await Promise.all([
                rootState.service.client.chat.globalBadges(),
                rootState.service.client.chat.badges(rootState.service.user.id)
            ]);

            global = global.data;
            channel = channel.data[0];

            const values = Object.values({ ...global, ...channel });
            const mapped = values.map(({ set_id, versions }) => {
                return Object.entries({ [set_id]: versions ? versions[0].image_url_1x : "" });
            }).flat(1);

            state.badges = {
                ...Object.fromEntries(mapped),
                subscriber: channel.versions[0].image_url_1x
            };

            return 0;
        },

        FORMAT: ({ state }, badges) => {
            if (!badges) {
                return [];
            }

            badges = Object.keys(badges);
            badges = badges.filter(badge => state.badges[badge]);
            return badges.map(badge => state.badges[badge]);
        }
    }
};