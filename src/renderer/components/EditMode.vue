<template>
    <div id="edit-mode">
        <div id="edit-mode-notification">
            <span id="edit-mode-notification-label" v-text="'Режим редактирования'" />
            <SolidButton :label="'Виджеты'" @clicked="openFullEdit" />
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from "electron";

import SolidButton from "~/components/SolidButton";

import WidgetsMixin from "~/mixins/widgets";

export default {
    components: {
        SolidButton
    },
    mixins: [WidgetsMixin],
    beforeDestroy() {
        ipcRenderer.send("turnMouse", false);
    },
    methods: {
        openFullEdit() {
            this.$router.replace("/edit").catch(() => {});
        }
    }
};
</script>

<style lang="scss">
#edit-mode {
    position: absolute;

    width: 100%;
    height: 100%;

    &-notification {
        position: absolute;
        top: 0px;
        left: 45%;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        justify-self: center;
        row-gap: 10px;

        width: 250px;
        height: max-content;

        padding: 15px;

        border-radius: 0px 0px 8px 8px;

        background: #181818cc;
    }
}
</style>