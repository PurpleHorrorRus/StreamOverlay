<template>
    <div id="modal" :class="{ first: settings.first, locked }">
        <Chat v-if="!settings.first && locked" :input="true" />
        <Notifications />
        <Lock :locked="locked" />
        <Header v-if="!settings.first && locked" />
        <div v-show="locked" id="modal-container">
            <Navigation v-show="!settings.first" />
            <div id="modal-container-page">
                <nuxt />
            </div>
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapState } from "vuex";

import Header from "~/components/menu/Header";
import Navigation from "~/components/menu/Navigation";
import Lock from "~/components/menu/Lock";
import Chat from "~/components/Chat";
import Notifications from "~/components/Notifications/Notifications";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Header,
        Navigation,
        Lock,
        Chat,
        Notifications
    },
    mixins: [CoreMixin],
    computed: {
        ...mapState({
            locked: state => state.ipc.locked
        })
    },
    created() {
        ipcRenderer.send("turnMouse", true);
    },
    methods: {
        exit() {
            if (!this.settings.first) {
                this.$router.replace("/").catch(() => {});
            }
        }
    }
};
</script>

<style lang="scss">
#modal {
    display: grid;
    grid-template-columns: 950px;
    grid-template-rows: 170px minmax(300px, max-content);
    grid-template-areas:
        "header"
        "container";

    row-gap: 5px;

    height: 100%;

    padding-top: 60px;

    justify-content: center;

    background: none;

    &.locked {
        background: #111111cc;
    }

    &.first {
        grid-template-rows: max-content;
        grid-template-areas: "container";
    }

    &-container {
        grid-area: "container";

        display: grid;
        grid-template-columns: 50px 900px;
        grid-template-rows: max-content;
        grid-template-areas: "items page";

        grid-gap: 20px 10px;

        min-width: 600px;

        background: $primary;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

        &-page {
            grid-area: page;
            width: 98%;
        }
    }

    .modal-content {
        width: 100%;

        .modal-body {
            padding: 5px;

            .modal-item-tip {
                padding: 10px 10px 0px 10px;

                &-text {
                    display: block;

                    margin-bottom: 10px;

                    color: #ccc;
                    font-size: 9pt;
                }
            }
        }
    }

    .modal-load {
        position: relative;
        top: 50%;
        left: 50%;
    }
}
</style>