import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    computed: {
        ...mapState({
            trovo: state => state.service.client,
            user: state => state.service.user,
            channel: state => state.service.channel
        })
    },

    methods: {
        ...mapActions({
            createTrovo: "trovo/INIT"
        })
    }
};