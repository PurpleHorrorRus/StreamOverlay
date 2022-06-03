import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    data: () => ({
        count: 0
    }),

    created() {
        if (!this.interval) {
            this.interval = setInterval(() => this.update(), 10 * 1000);
        }
    },

    mounted() {
        this.update();
    }
};