<template>
    <div id="meta-info-viewers">
        <ViewersIcon class="icon" />
        <span id="meta-info-viewers-count" v-text="viewers" />
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    components: {
        ViewersIcon: () => import("~/assets/icons/eye.svg")
    },

    computed: {
        ...mapState({
            viewers: state => state.service.viewers
        })
    }
};
</script>