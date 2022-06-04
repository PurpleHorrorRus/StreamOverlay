import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    data: () => ({
        count: 0
    }),

    async created() {
        await this.update();
    }
};