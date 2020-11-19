<template>
    <vue-draggable-resizable
        :class="{ active, nonactive: !active }"
        :draggable="active"
        :resizable="active"
        :w="source.width"
        :h="source.height"
        :x="source.x || source.left"
        :y="source.y || source.top"
        @dragstop="onDrag" 
        @resizestop="onResize"
    >
        <span v-if="active && name.length" class="movable_name" v-text="name" />
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
    position: relative;
    top: 5px;

    padding: 5px;

    background: rgba(255, 255, 255, .4);
    user-select: none; 
}
</style>