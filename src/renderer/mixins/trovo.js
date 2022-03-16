import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    computed: {
        ...mapState({
            trovo: state => state.trovo.service.client,
            user: state => state.trovo.service.user,
            channel: state => state.trovo.service.channel
        })
    },

    methods: {
        ...mapActions({
            createTrovo: "trovo/INIT"
        })
    }
};