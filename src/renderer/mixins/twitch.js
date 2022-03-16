import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    computed: {
        ...mapState({
            helix: state => state.twitch.service.client,
            user: state => state.twitch.service.user,

            twitchMessages: state => state.twitch.service.messages
        }),

        messages: {
            get() {
                return this.twitchMessages;
            }
        }
    },

    methods: {
        ...mapActions({
            createHelix: "twitch/INIT"
        })
    }
};