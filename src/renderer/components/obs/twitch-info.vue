<template>
    <div v-if="status.stream" id="twitch-info">
        <font-awesome-icon :icon="['fas', 'eye']" /> 
        <span v-if="viewers > -1" id="viewers_count" v-text="viewers" />
        <font-awesome-icon v-else id="viewers_count" :icon="['fa', 'circle-notch']" class="fa-spin" />
        <font-awesome-icon :icon="['fas', 'star']" /> 
        <span v-if="followers > -1" id="followers_count" v-text="followers" />
        <font-awesome-icon v-else id="viewers_count" :icon="['fas', 'circle-notch']" class="fa-spin" />
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    computed: {
        ...mapGetters({
            status: "obs/getStatus",
            followers: "twitch/getFollowers",
            viewers: "twitch/getViewers"
        })
    }
};
</script>

<style>
#twitch-info {
	display: inline-block;
    vertical-align: middle;
    margin-left: 5px;
    
    font-size: 16pt;
}

#viewers_count, #followers_count {
	display: inline-block;
}
</style>