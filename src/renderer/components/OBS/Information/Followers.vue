<template>
    <div id="meta-info-followers">
        <HeartIcon class="icon" />
        <span id="meta-info-followers-count" v-text="count" />
    </div>
</template>

<script>
import MetaInfoMixin from "~/components/OBS/Information/Mixin";

export default {
    components: {
        HeartIcon: () => import("~/assets/icons/heart.svg")
    },

    mixins: [MetaInfoMixin],

    computed: {
        interval: {
            get() { return this.$store.state.service.intervals.followers; },
            set(value) { this.$store.state.service.intervals.followers = value; }
        }
    },

    methods: {
        async update() {
            this.count = await this.serviceDispatch("FOLLOWERS_COUNT");
        }
    }
};
</script>