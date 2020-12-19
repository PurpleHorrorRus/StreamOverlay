import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],
    computed: {
        ...mapState({
            _active: state => state.widgets.edit,
            _widgets: state => state.widgets.widgets
        }),
        active: {
            get () { return this._active; },
            set (value) { this.turnEdit(value); }
        },
        widgets: {
            get () { return this._widgets; },
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
 