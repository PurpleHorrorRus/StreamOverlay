<template>
    <div id="status">
        <span 
            id="time" 
            v-text="formatTime" 
        />
    </div>
</template>

<script>
import OBSMixin from "~/mixins/obs";
import misc from "~/plugins/misc";

export default {
    mixins: [OBSMixin],
    computed: {
        fpsStyle () {
            return {
                color: this.status.tech.fps.toFixed(0) < status.videoSettings.fps ? "red" : "white"
            };
        },
        FPS () {
            return `FPS: ${this.status.tech.fps.toFixed(0)}`;
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

    vertical-align: middle;

    font-size: 9pt;

    #time {
        display: inline-block;
        width: 50px;
        
        margin-right: 5px;

        font-family: "Roboto Condensed", sans-serif;
        font-weight: 400;
    }
}
</style>