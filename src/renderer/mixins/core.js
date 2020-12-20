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
            setSettings: "settings/setSettings",
            saveSettings: "settings/saveSettings"
        })
    }
};