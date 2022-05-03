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
            saveSettings: "settings/SAVE"
        }),

        save(content = this.settings) {
            this.saveSettings({
                type: "settings",
                content
            });
        },

        deepChange(settings, field) {
            settings[field] = !settings[field];
            this.save();
            
            return settings;
        },

        async serviceDispatch(action, data) {
            return await this.$store.dispatch("SERVICE_DISPATCH", { action, data });
        }
    }
};