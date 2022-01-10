<template>
    <span id="menu-time" v-text="time" />
</template>

<script>
let interval = null;

export default {
    data: () => ({
        time: new Date().toLocaleTimeString("ru-RU")
    }),
    created() {
        interval = setInterval(() => (this.time = new Date().toLocaleTimeString("ru-RU")), 1000);
    },
    beforeDestroy() {
        clearInterval(interval);
        interval = null;
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