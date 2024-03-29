<template>
    <VueDraggableResizable
        ref="movable"
        v-click-away="resetZIndex"
        class="movable"
        :class="{ edit, selected }"
        :style="{ zIndex }"
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
        @click.native="changeZIndex(999)"
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
        },

        canBringTop: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    data: () => ({
        selected: false,

        x: 0,
        y: 0,

        leftBorder: -Infinity,
        upBorder: -Infinity,

        rightBorder: Infinity,
        downBorder: Infinity,

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
        if (this.config.settings.restriction) {
            const sourceWidth = this.source.width || this.$refs.movable.$el.offsetWidth;
            const sourceHeight = this.source.width || this.$refs.movable.$el.offsetHeight;

            this.leftBorder = 0;
            this.upBorder = 0;

            this.rightBorder = this.display.width - sourceWidth;
            this.downBorder = this.display.height - sourceHeight;
        }

        this.normalizePosition(this.source.x, this.source.y);
    },

    methods: {
        normalizePosition(x, y) {
            this.x = Math.max(Math.min(x, this.rightBorder), this.leftBorder);
            this.y = Math.max(Math.min(y, this.downBorder), this.upBorder);
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
                    this.x = Math.max(this.x - 1, this.leftBorder);
                    this.$children[0].moveHorizontally(this.x);
                    break;
                }

                case "ArrowDown": {
                    this.y = Math.min(this.y + 1, this.downBorder);
                    this.$children[0].moveVertically(this.y);
                    break;
                }

                case "ArrowUp": {
                    this.y = Math.max(this.y - 1, this.upBorder);
                    this.$children[0].moveVertically(this.y);
                    break;
                }
            }

            emitDebounce();
            mouseDebounce();
        },

        changeZIndex(index = 0) {
            if (!this.canBringTop) return false;

            this.zIndex = index;
            return true;
        },

        resetZIndex() {
            return this.changeZIndex(0);
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
        background: linear-gradient(var(--secondary), var(--secondary)) top
                center/calc(100%) 2px,
            linear-gradient(var(--secondary), var(--secondary)) bottom center/calc(100%) 2px,
            linear-gradient(var(--secondary), var(--secondary)) left center/2px calc(100%),
            linear-gradient(var(--secondary), var(--secondary)) right center/2px calc(100%);

        background-repeat: no-repeat;
        cursor: move;

        z-index: 1000 !important;

        .movable-slot * {
            pointer-events: none;
        }
    }
}
</style>