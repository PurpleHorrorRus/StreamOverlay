<template>
    <div id="modal-lock">
        <span id="modal-lock-tip" v-text="'Alt+A'" />
        <FontAwesomeIcon v-if="locked" :icon="['fa', 'lock']" style="color: lightgreen" />
        <FontAwesomeIcon v-else :icon="['fa', 'unlock']" style="color: red" />
    </div>
</template>

<script>
export default {
    props: {
        locked: {
            type: Boolean,
            required: true
        }
    }
};
</script>

<style lang="scss">
#modal-lock {
    position: absolute;
    top: 10px;
    right: 10px;

    font-size: 15pt;

    &-tip {
        padding: 5px;

        border-radius: 5px;
        background: rgba(0, 0, 0, 0.7);

        font-size: 10pt;
        font-weight: 600;
    }
}
</style>