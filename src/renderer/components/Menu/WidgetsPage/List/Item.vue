<template>
    <div class="widget-list-item" :class="{ active }">
        <span class="widget-list-item-name nowrap" v-text="widget.name" />
        <span class="widget-list-item-url nowrap small-text" v-text="widget.src" />
    </div>
</template>

<script>
export default {
    props: {
        widget: {
            type: Object,
            required: true
        }
    },

    computed: {
        active() {
            return this.widget.id === this.$parent.$parent.widget.id;
        }
    }
};
</script>

<style lang="scss">
.widget-list-item {
    display: flex;
    flex-direction: column;
    row-gap: 5px;

    padding: 5px;

    &:not(.active):hover {
        cursor: pointer;
        background: #5e5e5e40;
    }

    &.active {
        cursor: default;
        background: #5e5e5e80;
    }
}
</style>