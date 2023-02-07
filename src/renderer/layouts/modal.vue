<template>
    <div id="modal" name="fade" :class="{ hidden }">
        <Notifications />
        <Lock :locked="!hidden" />
        <ModalContent v-show="!hidden" />
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
        ModalContent: () => import("~/components/Menu/ModalContent.vue")
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
        })
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
}
</style>