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

    methods: {
        async update() {
            this.count = await this.serviceDispatch("VIEWERS_COUNT") || 0;
        }
    }
};
</script>