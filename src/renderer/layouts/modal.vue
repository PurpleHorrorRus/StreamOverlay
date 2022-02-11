<template>
    <div id="modal" name="fade" :class="{ locked, hidden }">
        <Notifications />
        <Lock :locked="locked" />
        <ModalContent v-show="locked" />
    </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapState } from "vuex";

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
        hidden: true
    }),
    computed: {
        ...mapState({
            locked: state => state.ipc.locked,
            openedUser: state => state.twitch.openedUser
        })
    },
    created() {
        ipcRenderer.send("turnMouse", true);
    },
    mounted() {
        this.hidden = false;
    },
    destroyed() {
        this.hidden = true;
        ipcRenderer.send("turnMouse", false);
    }
};
</script>

<style lang="scss">
#modal {
    width: 100%;
    height: 100%;

    opacity: 1;
    transition: opacity .04s linear;

    &.hidden {
        opacity: 0;
    }

    &.locked {
        background: #111111cc;
    }

    .modal-load {
        position: relative;
        top: 50%;
        left: 50%;
    }
}
</style>