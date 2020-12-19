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
        <slot v-if="!!$slots.default" />
    </vue-draggable-resizable>
</template>

<script>
import { mapGetters } from "vuex";

export default {
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
    computed: { 
        ...mapGetters({ 
            active: "widgets/getEdit" 
        }) 
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

    border: 2px solid $outline;
    cursor: move;
}

.nonactive.vdr {
    border: none;
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