<template>
    <vue-draggable-resizable
        :class="{ active, nonactive: !active }"
        :draggable="active"
        :resizable="resizable && active"
        :minWidth="source.minWidth || 0"
        :maxWidth="source.maxWidth || 0"
        :minHeight="source.minHeight || 0"
        :maxHeight="source.maxHeight || 0"
        :w="source.width"
        :h="source.height"
        :x="source.x || source.left"
        :y="source.y || source.top"
        @dragstop="onDrag"
        @resizestop="onResize"
    >
        <span v-if="active && name.length > 0" class="name nowrap" v-text="name" />
        <slot v-if="$slots.default" />
    </vue-draggable-resizable>
</template>

<script>
import WidgetsMixin from "~/mixins/widgets";

export default {
    mixins: [WidgetsMixin],
    props: {
        source: {
            type: Object,
            required: true
        },
        name: {
            type: String,
            required: false,
            default: "null"
        },
        resizable: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    methods: {
        onResize(...args) {
            this.$emit("onResize", ...args);
        },
        onDrag(...args) {
            this.$emit("onDrag", ...args);
        }
    }
};
</script>

<style lang="scss">
.vdr {
    position: absolute;
    left: 0px;
    top: 0px;

    border: none;

    &.active {
        background: linear-gradient($secondary, $secondary) top center/calc(100%) 2px,
            linear-gradient($secondary, $secondary) bottom center/calc(100%) 2px,
            linear-gradient($secondary, $secondary) left center/2px calc(100%),
            linear-gradient($secondary, $secondary) right center/2px calc(100%);

        background-repeat: no-repeat;
        cursor: move;
    }

    &.nonactive {
        background: none;
        cursor: default;
    }

    .name {
        position: absolute;
        top: -22px;

        width: 100%;
        height: 22px;

        padding: 5px;

        background: $secondary;
        border-radius: 10px 10px 0px 0px;

        text-align: center;

        font-size: 9pt !important;
        user-select: none;
    }
}
</style>