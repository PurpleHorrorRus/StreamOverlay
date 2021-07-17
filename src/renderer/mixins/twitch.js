import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],
    computed: {
        ...mapState({
            helix: state => state.twitch.helix,
            user: state => state.twitch.credits
        })
    },
    methods: {
        ...mapActions({
            createHelix: "twitch/CREATE_HELIX",
            createChatBot: "twitch/CREATE_CHATBOT"
        })
    }
};