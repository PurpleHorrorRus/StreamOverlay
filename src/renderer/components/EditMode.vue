<template>
    <div id="edit-mode-notification">
        <span
            id="edit-mode-notification-label"
            v-text="$strings.MENU.EDIT.TITLE"
        />

        <SolidButton
            :label="$strings.MENU.EDIT.WIDGETS"
            @click.native="openFullEdit"
        />
    </div>
</template>

<script>
import WidgetsMixin from "~/mixins/widgets";

export default {
    mixins: [WidgetsMixin],

    beforeDestroy() {
        this.$ipc.send("turnMouse", false);
        this.edit = false;
    },

    created() {
        this.$ipc.send("turnMouse", true);
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