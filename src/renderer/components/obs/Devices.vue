<template>
  	<div id="devices">
		<font-awesome-icon :icon="['fas', 'microphone']" class="device" :class="{ enabled: devices.mic, disabled: !devices.mic }"/>
		<font-awesome-icon :icon="['fas', 'headphones']" class="device" :class="{ enabled: devices.sound, disabled: !devices.sound }"/>
		<font-awesome-icon :icon="['fas', 'camera']" class="device" v-if="devices.camera !== null" :class="{ enabled: devices.camera, disabled: !devices.camera }"/>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    computed: {
        ...mapGetters({
            devices: "obs/getDevices"
        })
    }
}
</script>

<style lang="scss">
#devices {
	display: inline-block;

	font-size: 16pt;
	vertical-align: middle;

    .device {
        margin-left: 5px;

        &.enabled {
            color: $text;
        }
        
        &.disabled {
            color: red;
        }
    }
}
</style>