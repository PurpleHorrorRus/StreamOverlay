<template>
    <div id="edit-mode-notification">
        <span id="edit-mode-notification-label" v-text="'Режим редактирования'" />
        <SolidButton :label="'Виджеты'" @clicked="openFullEdit" />
    </div>
</template>

<script>
import { ipcRenderer } from "electron";

import WidgetsMixin from "~/mixins/widgets";

export default {
    mixins: [WidgetsMixin],

    beforeDestroy() {
        ipcRenderer.send("turnMouse", false);
        this.active = false;
    },

    created() {
        ipcRenderer.send("turnMouse", true);
    },

    methods: {
        openFullEdit() {
            this.$router.replace("/edit").catch(() => {});
        }
    }
};
</script>

<style lang="scss">
#edit-mode-notification {
    position: absolute;
    top: 0px;
    left: 40%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-self: center;
    justify-self: center;
    row-gap: 10px;

    width: 250px;
    height: max-content;

    padding: 15px;

    border-radius: 0px 0px 8px 8px;
    background: #181818cc;
}
</style>