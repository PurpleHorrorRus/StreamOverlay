<template>
    <div id="meta-info-viewers">
        <ViewersIcon class="icon" />
        <span id="meta-info-viewers-count" v-text="count" />
    </div>
</template>

<script>
import MetaInfoMixin from "~/components/OBS/Information/Mixin";

export default {
    components: {
        ViewersIcon: () => import("~/assets/icons/eye.svg")
    },

    mixins: [MetaInfoMixin],

    computed: {
        interval: {
            get() { return this.$store.state.service.intervals.viewers; },
            set(value) { this.$store.state.service.intervals.viewers = value; }
        }
    },

    methods: {
        async update() {
            this.count = await this.serviceDispatch("VIEWERS_COUNT");
        }
    }
};
</script>