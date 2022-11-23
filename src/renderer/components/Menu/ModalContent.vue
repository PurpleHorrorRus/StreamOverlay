<template>
    <div id="modal-locked">
        <Chat v-if="showChat" :input="true" />
        <ModalTime v-if="$parent.locked" />

        <MenuHeader v-if="showHeader" />
        <ModalContainer />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    components: {
        Chat: () => import("../Chat.vue"),
        ModalTime: () => import("./Time.vue"),

        MenuHeader: () => import("./Header.vue"),
        ModalContainer: () => import("./ModalContainer.vue")
    },

    mixins: [CoreMixin],

    computed: {
        showChat() {
            return this.settings.chat.enable;
        },

        showHeader() {
            return this.user
                && !this.settings.first;
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

    z-index: 0;

    &.first {
        grid-template-columns: 1fr;
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