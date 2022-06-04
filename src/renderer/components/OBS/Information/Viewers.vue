<template>
    <div id="meta-info-viewers">
        <ViewersIcon class="icon" />
        <span id="meta-info-viewers-count" v-text="count" />
    </div>
</template>

<script>
import MetaInfoMixin from "~/components/OBS/Information/Mixin";

let interval = null;

export default {
    components: {
        ViewersIcon: () => import("~/assets/icons/eye.svg")
    },

    mixins: [MetaInfoMixin],

    mounted() {
        interval = setInterval(() => this.update(), 10 * 1000);
    },

    beforeDestroy() {
        clearInterval(interval);
    },

    methods: {
        async update() {
            this.count = await this.serviceDispatch("VIEWERS_COUNT");
        }
    }
};
</script>