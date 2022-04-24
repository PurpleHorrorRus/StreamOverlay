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

import Notifications from "~/components/Notifications/Notifications";
import Lock from "~/components/Menu/Lock";
import ModalContent from "~/components/Menu/ModalContent";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Notifications,
        Lock,
        ModalContent
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
        this.turnLock(true);

        ipcRenderer.on("turnLock", (_event, mouse) => {
            this.hidden = !mouse;
        });
    },

    beforeDestroy() {
        this.hidden = false;
        this.turnLock(false);
        ipcRenderer.removeAllListeners("turnLock");
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

    background: #111111cc;

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