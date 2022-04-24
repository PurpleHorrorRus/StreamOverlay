import CoreMixin from "~/mixins/core";

let interval = null;

export default {
    mixins: [CoreMixin],

    data: () => ({
        count: 0
    }),

    async created() {
        await this.update();
        interval = setInterval(() => this.update(), 10 * 1000);
    },

    beforeDestroy() {
        this.destroy();
    },
    
    destroyed() {
        this.destroy();
    },

    methods: {
        destroy() {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }
    }
};