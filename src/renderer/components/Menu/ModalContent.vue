<template>
    <div id="modal-locked">
        <Chat v-if="!$parent.settings.first && $parent.settings.chat.enable" :input="true" />
        <Time v-if="$parent.locked" />

        <Header v-if="!$parent.settings.first" />
        <ModalContainer />
    </div>
</template>

<script>
import Chat from "~/components/Chat";
import Time from "~/components/menu/Time";

import Header from "~/components/menu/Header";
import ModalContainer from "~/components/menu/ModalContainer";

export default {
    components: {
        Chat,
        Time,

        Header,
        ModalContainer
    }
};
</script>

<style lang="scss">
#modal-locked {
    display: grid;
    grid-template-columns: 950px;
    grid-template-rows: 170px minmax(300px, max-content) minmax(
            160px,
            max-content
        );
    grid-template-areas:
        "header"
        "container";

    column-gap: 10px;
    row-gap: 5px;

    padding-top: 60px;

    justify-content: center;

    background: none;

    .modal-content {
        width: 100%;

        .modal-title {
            padding: 5px;

            font-size: 14pt;
            font-weight: bold;

            border-bottom: 1px solid $secondary;
        }

        .modal-body {
            padding: 5px;

            > * {
                margin: 10px 0px;
            }

            .modal-item {
                &-tip {
                    display: block;
                    
                    margin: 10px 0px;

                    color: $small-text;
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