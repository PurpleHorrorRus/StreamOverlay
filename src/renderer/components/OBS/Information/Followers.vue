<template>
    <div id="meta-info-followers">
        <HeartIcon class="icon" />
        <span id="meta-info-followers-count" v-text="followers" />
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    components: {
        HeartIcon: () => import("~icons/heart.svg")
    },

    computed: {
        ...mapState({
            followers: state => state.service.followers
        })
    }
};
</script>