<template>
    <div id="status">
        <span 
            id="time" 
            v-text="formatTime" 
        />
        <span 
            id="fps" 
            :style="fpsStyle"
            v-text="FPS"
        />
    </div>
</template>

<script>
import { mapGetters } from "vuex";

import misc from "~/plugins/misc";

export default {
    computed: {
        ...mapGetters({ 
            status: "obs/getStatus" 
        }),
        fpsStyle () {
            return {
                color: this.status.fps.toFixed(0) < 60 ? "red" : "white"
            };
        },
        FPS () {
            return `FPS: ${this.status.fps.toFixed(0)}`;
        },
        formatTime () { 
            return misc.formatTime(this.status.time); 
        }
    }
};
</script>

<style lang="scss">
#status {
	display: inline-block;

	margin-left: 10px;
	margin-right: 10px;

    vertical-align: middle;

    #time {
        display: inline-block;
        
	    margin-right: 5px;
    }
}
</style>