<template>
    <vue-draggable-resizable
        :class="{ active, nonactive: !active }"
        :draggable="active"
        :resizable="resizable && active"
        :w="source.width"
        :h="source.height"
        :x="source.x || source.left"
        :y="source.y || source.top"
        @dragstop="onDrag" 
        @resizestop="onResize"
    >
        <span v-if="active && name.length > 0" class="movable_name nowrap" v-text="name" />
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
        onResize (...args) { 
            this.$emit("onResize", ...args); 
        },
        onDrag (...args) {
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

    background:
        linear-gradient($secondary,$secondary) top center/calc(100%) 2px,
        linear-gradient($secondary,$secondary) bottom center/calc(100%) 2px,
        linear-gradient($secondary,$secondary) left center/2px calc(100%),
        linear-gradient($secondary,$secondary) right center/2px calc(100%);

    background-repeat: no-repeat;
    cursor: move;

    border: none;
}

.nonactive.vdr {
    background: none;
}

.movable_name {
    position: absolute;
    top: 0px;

    width: 100%;

    padding: 5px;

    background: rgba(255, 255, 255, .4);
    user-select: none; 
}
</style>