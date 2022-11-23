import { mapActions } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    computed: {
        edit: {
            get () { return this.$store.state.widgets.edit; },
            set (value) { this.turnEdit(value); }
        },

        widgets: {
            get () { return this.$store.state.widgets.widgets; },
            set (value) { this.saveWidgets(value); }
        }
    },

    methods: {
        ...mapActions({
            turnEdit: "widgets/TURN_EDIT",
            setWidgets: "widgets/SET",
            saveWidgets: "widgets/SAVE"
        })
    }
};