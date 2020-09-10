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
        <span v-if="active" class="movable_name" v-text="name" />
        <slot />
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
            active: "overlays/getEdit" 
        }) 
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
    height: max-content;
    border: 2px solid $secondary; 
}

.nonactive.vdr {
    border: none;
    pointer-events: none;
}

.movable_name {
    padding: 5px;
    background: rgba(255, 255, 255, .4);
    position: relative;
    top: 5px;
    cursor: move;
    user-select: none;
}
</style>