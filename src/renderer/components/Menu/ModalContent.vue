<template>
    <div id="modal-locked" :class="{ first: settings.first }">
        <Chat v-if="showChat" :input="true" />
        <Time v-if="$parent.locked" />

        <Header v-if="showHeader" />
        <ModalContainer />
    </div>
</template>

<script>
import Chat from "~/components/Chat";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Chat,
        Time: () => import("~/components/Menu/Time"),

        Header: () => import("~/components/Menu/Header"),
        ModalContainer: () => import("~/components/Menu/ModalContainer")
    },

    mixins: [CoreMixin],

    computed: {
        showChat() {
            return !this.settings.first 
                && this.settings.chat.enable;
        },

        showHeader() {
            return !this.settings.first 
                && this.user;
        }
    }
};
</script>

<style lang="scss">
#modal-locked {
    display: grid;
    grid-template-columns: 950px;
    grid-template-rows: 170px minmax(300px, max-content);
    grid-template-areas:
        "header"
        "container";

    column-gap: 10px;
    row-gap: 5px;

    padding-top: 60px;

    justify-content: center;

    background: none;

    &.first {
        grid-template-rows: minmax(300px, max-content);
        grid-template-areas: "container";
    }

    .modal-content {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 35px 1fr;
        grid-template-areas: "title" "body";
        row-gap: 10px;
        
        .modal-body {
            grid-area: body;

            .modal-item {
                &-tip {
                    display: block;
                    
                    margin: 10px 0px;

                    color: var(--small-text);
                    font-size: 12px;
                }

                &-notification {
                    display: block;

                    width: 100%;
                    height: max-content;

                    margin: 10px 0px;
                    padding: 10px;

                    border-radius: 4px;

                    user-select: text;
                }
            }
        }
    }
}
</style>