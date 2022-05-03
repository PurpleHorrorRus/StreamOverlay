<template>
    <span id="menu-time" v-text="time" />
</template>

<script>
let interval = null;

export default {
    data: () => ({
        time: 0
    }),

    created() {
        this.update();
        interval = setInterval(() => this.update(), 1000);
    },

    beforeDestroy() {
        clearInterval(interval);
        interval = null;
    },

    methods: {
        update() {
            this.time = new Date().toLocaleTimeString("ru-RU");
        }
    }
};
</script>

<style lang="scss">
#menu-time {
    position: absolute;
    left: 2%;
    top: 3%;

    font-size: 32px;

    z-index: 0;
}
</style>