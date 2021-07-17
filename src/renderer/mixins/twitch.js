import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],
    computed: {
        ...mapState({
            helix: state => state.twitch.helix,
            credits: state => state.twitch.credits,
            user: state => state.twitch.user
        })
    },
    methods: {
        ...mapActions({
            createHelix: "twitch/CREATE_HELIX",
            createChatBot: "twitch/CREATE_CHATBOT"
        })
    }
};