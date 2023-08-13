<template>
    <div id="modal" name="fade" :class="{ hidden }">
        <Notifications />
        <Lock :locked="!hidden" />
        <ModalContent v-show="!hidden" />

        <XIcon
            v-if="!hidden"
            id="modal-quit"
            v-tooltip.left="$strings.MENU.QUIT"
            class="icon clickable"
            @click="quit"
        />
    </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapActions, mapState } from "vuex";

import CoreMixin from "~/mixins/core";

export default {
	components: {
		Notifications: () => import("~/components/Notifications/Notifications.vue"),
		Lock: () => import("~/components/Menu/Lock.vue"),
		ModalContent: () => import("~/components/Menu/ModalContent.vue"),

		XIcon: () => import("~/assets/icons/x.svg")
	},

	mixins: [CoreMixin],

	data: () => ({
		hidden: false
	}),

	computed: {
		...mapState({
			locked: state => state.ipc.locked
		})
	},

	created() {
		document.getElementsByTagName("html")[0].classList.add(this.config.settings.service);

		this.turnLock(true);

		ipcRenderer.on("turnLock", (_event, mouse) => {
			this.hidden = !mouse;
		});
	},

	beforeDestroy() {
		this.hidden = false;
		this.turnLock(false);
		return ipcRenderer.removeAllListeners("turnLock");
	},

	methods: {
		...mapActions({
			turnLock: "ipc/TURN_LOCK"
		}),

		quit() {
			return this.$ipc.send("quit");
		}
	}
};
</script>

<style lang="scss">
#modal {
    width: 100%;
    height: 100%;

    background: var(--primary);

    &.hidden {
        background: none;
    }

    .modal-load {
        position: relative;
        top: 50%;
        left: 50%;
    }

    &-quit {
		position: absolute;
		top: 40px;
		right: 10px;

		width: 30px;
		height: 30px;
	}
}
</style>