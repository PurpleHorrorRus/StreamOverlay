import { mapActions } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    computed: {
        edit: {
            get () { return this.$store.state.widgets.edit; },
            set (value) { this.turnEdit(value); }
        }
    },

    methods: {
        ...mapActions({
            turnEdit: "widgets/TURN_EDIT"
        })
    }
};