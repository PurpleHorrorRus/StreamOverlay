import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],
    computed: {
        ...mapState({
            helix: state => state.twitch.helix,
            user: state => state.twitch.user,
            viewers: state => state.twitch.viewers,
            followers: state => state.followers.count
        })
    },
    methods: {
        ...mapActions({
            createHelix: "twitch/createHelix",
            createChatBot: "twitch/createChatBot",
            runInterval: "twitch/runInterval"
        })
    }
};