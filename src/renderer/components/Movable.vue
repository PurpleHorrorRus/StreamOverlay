<template>
    <VueDraggableResizable
        ref="movable"
        :class="{ active }"
        :draggable="active"
        :resizable="resizable && active"
        :minWidth="source.minWidth || 0"
        :maxWidth="source.maxWidth || 0"
        :minHeight="source.minHeight || 0"
        :maxHeight="source.maxHeight || 0"
        :w="source.width"
        :h="source.height"
        :x="x"
        :y="y"
        @activated="onActivated"
        @deactivated="onDeactivated"
        @dragging="onDragging"
        @dragstop="onDrag"
        @resizestop="onResize"
    >
        <MovableName v-if="active && name" />
        <slot v-if="$slots.default" />
    </VueDraggableResizable>
</template>

<script>
import { mapState } from "vuex";
import { debounce } from "lodash";

import VueDraggableResizable from "vue-draggable-resizable";
import MovableName from "~/components/Movable/MovableName";

import WidgetsMixin from "~/mixins/widgets";

const snapOffset = 15;

let emitDebounce = null;
let mouseDebounce = null;

export default {
    components: {
        VueDraggableResizable,
        MovableName
    },
    
    mixins: [WidgetsMixin],

    props: {
        source: {
            type: Object,
            required: true
        },

        name: {
            type: String,
            required: false,
            default: ""
        },

        resizable: {
            type: Boolean,
            required: false,
            default: true
        },

        visible: {
            type: Boolean,
            required: false,
            default: undefined
        }
    },

    data: () => ({
        x: 0,
        y: 0,
        rightBorder: 0,
        downBorder: 0,
        mouse: true,
        zIndex: 0
    }),

    computed: {
        ...mapState({
            display: state => state.config.display
        })
    },

    mounted() {
        this.rightBorder = this.display.width - this.source.width;
        this.downBorder = this.display.height - this.source.height - snapOffset;

        this.normalizePosition(
            (this.source.x || this.source.left) || 0, 
            (this.source.y || this.source.top) || 0
        );

        if (this.active) {
            emitDebounce = debounce(() => this.$parent.onDrag(this.x, this.y), 1000);
            mouseDebounce = debounce(() => (this.mouse = true), 500);
        }
    },
    
    beforeDestroy() {
        this.onDeactivated();
    },

    methods: {
        normalizePosition(x, y) {
            this.x = Math.max(Math.min(x, this.rightBorder + snapOffset), 0);
            this.y = Math.max(Math.min(y, this.downBorder + snapOffset), 0);
        },

        onResize(...args) {
            this.$parent.onResize(...args);
        },

        onDragging(x, y) {
            this.normalizePosition(x, y);

            if (this.mouse) {
                if (x !== this.x) {
                    this.$children[0].moveHorizontally(this.x);
                }

                if (y !== this.y) {
                    this.$children[0].moveVertically(this.y);
                }
            }

            emitDebounce();
        },

        onDrag() {
            this.$parent.onDrag(this.x, this.y);
        },

        onActivated() {
            if (this.active) {
                document.addEventListener("keydown", this.move);
            }
        },

        onDeactivated() {
            if (this.active) {
                emitDebounce();
                document.removeEventListener("keydown", this.move);
            }
        },

        move({ key }) {
            this.mouse = false;

            switch (key) {
                case "ArrowRight": {
                    this.x = Math.min(this.x + 1, this.rightBorder);
                    this.$children[0].moveHorizontally(this.x);
                    break;
                }

                case "ArrowLeft": {
                    this.x = Math.max(this.x - 1, 0);
                    this.$children[0].moveHorizontally(this.x);
                    break;
                }
                
                case "ArrowDown": {
                    this.y = Math.min(this.y + 1, this.downBorder);
                    this.$children[0].moveVertically(this.y);
                    break;
                }

                case "ArrowUp": {
                    this.y = Math.max(this.y - 1, 0);
                    this.$children[0].moveVertically(this.y);
                    break;
                }
            }

            if (emitDebounce) {
                emitDebounce();
                mouseDebounce();
            }
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
        background: linear-gradient($secondary, $secondary) top
                center/calc(100%) 2px,
            linear-gradient($secondary, $secondary) bottom center/calc(100%) 2px,
            linear-gradient($secondary, $secondary) left center/2px calc(100%),
            linear-gradient($secondary, $secondary) right center/2px calc(100%);

        background-repeat: no-repeat;
        cursor: move;
    }

    &:not(.active) {
        background: none;
        cursor: default;
    }
}
</style>