import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    computed: {
        ...mapState({
            helix: state => state.service.client,
            user: state => state.service.user
        })
    },

    methods: {
        ...mapActions({
            createHelix: "twitch/INIT"
        })
    }
};