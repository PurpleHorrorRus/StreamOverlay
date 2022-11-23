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
            settings: state => state.settings.settings,

            client: state => state.service.client,

            user: state => state.service.user,
            connected: state => state.service.connected
        })
    },

    methods: {
        ...mapActions({
            addNotification: "notifications/ADD",

            setConfig: "SET_CONFIG",
            setSettings: "settings/SET",
            saveSettings: "settings/SAVE",
            saveCustom: "settings/SAVE_CUSTOM",

            setActivity: "discord/SET_ACTIVITY",
            clearActivity: "discord/CLEAR_ACTIVITY"
        }),

        save(content = this.settings) {
            this.saveSettings(content);
        },

        deepChange(category, option, value = "", type = "settings") {
            switch (typeof category[option]) {
                case "boolean": {
                    category[option] = !category[option];
                    break;
                }

                case "string": case "number": {
                    if (!value) return;
                    category[option] = value;
                    break;
                }
            }

            type === "settings"
                ? this.saveSettings(this.settings)
                : this.saveCustom({
                    type: String(type),
                    settings: this.config[type]
                });

            return category[option];
        },

        async serviceDispatch(action, data) {
            return await this.$store.dispatch("SERVICE_DISPATCH", { action, data });
        }
    }
};