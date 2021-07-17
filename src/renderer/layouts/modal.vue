<template>
    <div id="modal">
        <Chat v-if="!settings.first && locked" :input="true" />
        <Lock :locked="locked" />
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

import Navigation from "~/components/menu/Navigation";
import Lock from "~/components/menu/Lock";
import Chat from "~/components/Chat";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Navigation,
        Lock,
        Chat
    },
    mixins: [CoreMixin],
    computed: {
        ...mapState({
            locked: state => state.ipc.locked
        }),
    },
    mounted() {
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
    display: flex;
    justify-content: center;
    align-items: flex-start;

    height: 100%;

    margin-top: 5%;

    background: none;

    &-container {
        display: grid;
        grid-template-columns: 50px 900px;
        grid-template-rows: max-content;
        grid-template-areas: "items page";

        grid-gap: 20px 10px;

        min-width: 600px;

        background: #141414;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

        &-page {
            grid-area: page;
            width: 98%;
        }
    }

    .modal-content {
        width: 100%;

        .modal-title {
            padding: 5px;

            font-size: 14pt;
            font-weight: bold;

            border-bottom: 1px solid #ccc;
        }

        .modal-body {
            padding: 5px;

            .modal-item-tip {
                padding: 10px 10px 0px 10px;

                &-text {
                    display: block;

                    color: #ccc;
                    font-size: 9pt;
                }
            }
        }
    }
}
</style>