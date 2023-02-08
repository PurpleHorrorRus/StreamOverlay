import { mapActions, mapState } from "vuex";

export default {
    data: () => ({
        services: {
            twitch: "twitch",
            trovo: "trovo"
        }
    }),

    computed: {
        ...mapState({
            config: state => state.config,

            client: state => state.service.client,

            user: state => state.service.user,
            connected: state => state.service.connected
        })
    },

    methods: {
        ...mapActions({
            addNotification: "notifications/ADD",

            setActivity: "discord/SET_ACTIVITY",
            clearActivity: "discord/CLEAR_ACTIVITY"
        }),

        deepChange(category, root, option, value = "") {
            if (!this.config[category]) {
                console.error("Can't change state", category);
                return root[option];
            }

            switch (typeof root[option]) {
                case "boolean": {
                    root[option] = !root[option];
                    break;
                }

                case "string": case "number": {
                    if (value === null || value === undefined) {
                        return false;
                    }

                    root[option] = value;
                    break;
                }
            }

            this.config[category].save();
            return root[option];
        },

        async serviceDispatch(action, data) {
            return await this.$store.dispatch("SERVICE_DISPATCH", { action, data });
        }
    }
};