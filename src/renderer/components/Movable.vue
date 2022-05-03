<template>
    <VueDraggableResizable
        ref="movable"
        class="movable"
        :class="{ edit, selected }"
        :draggable="edit"
        :resizable="edit && resizable"
        :minWidth="source.minWidth || 0"
        :maxWidth="source.maxWidth || 0"
        :minHeight="source.minHeight || 0"
        :maxHeight="source.maxHeight || 0"
        :w="source.width"
        :h="source.height"
        :x="x"
        :y="y"
        :active="selected"
        @activated="onActivated"
        @deactivated="onDeactivated"
        @dragging="onDragging"
        @dragstop="onDrag"
        @resizestop="onResize"
    >
        <MovableName v-if="edit && name" />
        <slot v-if="$slots.default" />
    </VueDraggableResizable>
</template>

<script>
import { mapState } from "vuex";
import { debounce } from "lodash";

import VueDraggableResizable from "vue-draggable-resizable";

import WidgetsMixin from "~/mixins/widgets";

const snapOffset = 15;

let emitDebounce = null;
let mouseDebounce = null;

export default {
    components: {
        VueDraggableResizable,
        MovableName: () => import("~/components/Movable/MovableName")
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
        selected: false,
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

    watch: {
        edit: function(edit) {
            if (!edit) {
                this.onDeactivated();
            }
        }
    },

    mounted() {
        this.rightBorder = this.display.width - this.source.width + snapOffset;
        this.downBorder = this.display.height - this.source.height;

        this.normalizePosition(
            (this.source.x || this.source.left) || 0, 
            (this.source.y || this.source.top) || 0
        );
    },

    methods: {
        normalizePosition(x, y) {
            this.x = Math.max(Math.min(x, this.rightBorder), 0);
            this.y = Math.max(Math.min(y, this.downBorder), 0);
        },

        onResize(...args) {
            this.$parent.onResize(...args);
        },

        onDragging(x, y) {
            if (!this.selected) {
                return false;
            }

            if (this.mouse) {
                if (x !== this.x) this.$children[0].moveHorizontally(this.x);
                if (y !== this.y) this.$children[0].moveVertically(this.y);
            }

            this.normalizePosition(x, y);
            emitDebounce();

            return true;
        },

        onDrag() {
            this.$parent.onDrag(this.x, this.y);
        },

        onActivated() {
            if (this.edit) {
                this.selected = true;
                emitDebounce = debounce(() => this.$parent.onDrag(this.x, this.y), 1000);
                mouseDebounce = debounce(() => (this.mouse = true), 500);
                document.addEventListener("keydown", this.move);
            }
        },

        onDeactivated() {
            this.selected = false;
            document.removeEventListener("keydown", this.move);
            if (emitDebounce) emitDebounce();
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

            emitDebounce();
            mouseDebounce();
        }
    }
};
</script>

<style lang="scss">
.movable {
    position: absolute;
    top: 0px;
    left: 0px;

    border: none;

    &.edit {
        background: linear-gradient($secondary, $secondary) top
                center/calc(100%) 2px,
            linear-gradient($secondary, $secondary) bottom center/calc(100%) 2px,
            linear-gradient($secondary, $secondary) left center/2px calc(100%),
            linear-gradient($secondary, $secondary) right center/2px calc(100%);

        background-repeat: no-repeat;
        cursor: move;

        z-index: 1000 !important;

        .movable-slot * {
            pointer-events: none;
        }
    }
}
</style>