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
            setSettings: "settings/SET",
            saveSettings: "settings/SAVE"
        }),

        save(content = this.settings) {
            this.saveSettings({
                type: "settings",
                content
            });
        },

        deepChange(settings, template) {
            console.log("template", template);
            let field = template;

            if (~template.indexOf("/")) {
                template = template.split("/");
                field = template[0];
                console.log("field", field);
                template.splice(0, 1);
                return this.deepChange(settings[field], template.join("/"));
            }

            settings[field] = !settings[field];
            this.save();
            
            return settings;
        },

        async serviceDispatch(action, data) {
            return await this.$store.dispatch(`${this.settings.service}/${action}`, data);
        }
    }
};