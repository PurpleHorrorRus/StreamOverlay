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

            helix: state => state.twitch.service.client,
            trovo: state => state.trovo.service.client,

            twitchUser: state => state.twitch.service.user,
            trovoUser: state => state.trovo.service.user
        }),

        user() {
            switch(this.settings.service) {
                case this.services.twitch: return this.twitchUser;
                case this.services.trovo: return this.trovoUser;
            }

            return this.twitchUser;
        }
    },

    methods: {
        ...mapActions({
            addNotification: "notifications/ADD",
            setSettings: "settings/SET",
            saveSettings: "settings/SAVE"
        }),

        save(content = this.settings) {
            this.saveSettings({
                type: "settings",
                content
            });
        }
    }
};