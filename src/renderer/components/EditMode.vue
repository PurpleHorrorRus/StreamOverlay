<template>
    <div id="edit-mode">
        <div id="edit-mode-notification">
            <span id="edit-mode-notification-label" v-text="'Режим редактирования'" />
            <button @click="openFullEdit" v-text="'Ред.'" />
            <button @click="exitEdit" v-text="'Выйти'" />
        </div>
    </div>
</template>

<script>
import WidgetsMixin from "~/mixins/widgets";

export default {
    mixins: [WidgetsMixin],
    methods: {
        openFullEdit () {
            this.$router.replace("/edit").catch(() => {});
            this.active = true;
        },
        exitEdit () {
            this.$router.replace("/").catch(() => {});
            this.active = false;
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
        
        width: 200px;
        height: 60px;
        
        background: rgba(0, 0, 0, 0.4);
        text-align: center;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        z-index: 9;

        &-label {
            display: inline-block;
            
            margin-bottom: 5px;
        }
    }

    &-widgets {
        position: absolute;
        width: 100%;
        height: 100%;
    }
}
</style>