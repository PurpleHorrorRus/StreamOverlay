<template>
    <div id="modal">
        <Chat />
        <div id="modal-lock">
            <font-awesome-icon v-if="locked" :icon="['fa', 'lock']" style="color: lightgreen" />
            <font-awesome-icon v-else :icon="['fa', 'unlock']" style="color: red" />
        </div>
        <div v-show="locked" id="modal-container">
            <nuxt />
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapGetters } from "vuex";

import Chat from "~/components/Chat";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Chat
    },
    mixins: [CoreMixin],
    computed: {
        ...mapGetters({
            locked: "ipc/getLock"
        })
    },
    mounted () { 
        ipcRenderer.send("turnMouse", true); 
    },
    methods: {
        exit () {
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

    &-lock {
        position: absolute;
        top: 10px;
        right: 10px;

        font-size: 15pt;
    }

    &-container {
        display: flex;
        justify-content: flex-start;
        align-content: center;
        align-items: center;
        flex-wrap: wrap;

        width: 600px;

        padding: 15px;

        background: #141414;
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
                &-text {
                    position: relative;
                    left: 5px;

                    color: #ccc;
                    font-size: 9pt;    
                }
            }
        }
    }
}
</style>