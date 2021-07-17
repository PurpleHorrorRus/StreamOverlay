import { mapActions, mapState } from "vuex";

export default {
    computed: {
        ...mapState({
            config: state => state.config,
            settings: state => state.settings.settings
        })
    },
    methods: {
        ...mapActions({
            addNotification: "notifications/ADD",
            setSettings: "settings/SET",
            saveSettings: "settings/SAVE"
        }),
        save() {
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    }
};