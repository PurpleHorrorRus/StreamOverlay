<template>
    <vue-draggable-resizable
        ref="movable"
        :class="{ active, nonactive: !active }"
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
        <div v-if="active && name.length > 0" class="movable-title" :class="{ widget: visible !== undefined }">
            <div v-if="visible !== undefined" class="movable-title-visible" @click="$emit('turnVisible')">
                <EyeIcon v-if="visible" class="icon clickable" />
                <EyeCrossedIcon v-else class="icon clickable" />
            </div>

            <span class="movable-title-name nowrap" v-text="name" />
        </div>
        <slot v-if="$slots.default" />    
    </vue-draggable-resizable>
</template>

<script>
import { mapState } from "vuex";
import { debounce } from "lodash";

import EyeIcon from "~/assets/icons/eye.svg";
import EyeCrossedIcon from "~/assets/icons/eye-crossed.svg";

import WidgetsMixin from "~/mixins/widgets";

const snapOffset = 15;

let emitDebounce = null;
let mouseDebounce = null;

export default {
    components: {
        EyeIcon,
        EyeCrossedIcon
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
            default: "null"
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
        mouse: true
    }),
    computed: {
        ...mapState({
            display: state => state.config.display
        })
    },
    created() {
        this.x = this.source.x ?? this.source.left;
        this.y = this.source.y ?? this.source.top;

        if (this.active) {
            this.rightBorder = this.display.width - this.source.width - snapOffset;
            this.downBorder = this.display.height - this.source.height - snapOffset;

            emitDebounce = debounce(() => this.$emit("onDrag", ...[this.x, this.y]), 1000);
            mouseDebounce = debounce(() => (this.mouse = true), 500);
        }
    },
    beforeDestroy() {
        if (this.active) {
            this.onDeactivated();
        }
    },
    methods: {
        onResize(...args) {
            this.$emit("onResize", ...args);
        },
        onDragging(x, y) {
            this.x = Math.max(Math.min(x, this.rightBorder + snapOffset), -1);
            this.y = Math.max(Math.min(y, this.downBorder + snapOffset), -1);

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
        onDrag(...args) {
            this.$emit("onDrag", ...args);
        },
        onActivated() {
            document.addEventListener("keydown", this.move);
        },
        onDeactivated() {
            this.$emit("onDrag", ...[this.x, this.y]);
            document.removeEventListener("keydown", this.move);
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
                    this.x = Math.max(this.x - 1, -1);
                    this.$children[0].moveHorizontally(this.x);
                    break;
                }
                case "ArrowDown": {
                    this.y = Math.min(this.y + 1, this.downBorder);
                    this.$children[0].moveVertically(this.y);
                    break;
                }
                case "ArrowUp": {
                    this.y = Math.max(this.y - 1, -1);
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

    .movable-title {
        position: absolute;
        top: -29px;

        display: grid;
        grid-template-columns: 1fr;
        align-items: center;
        column-gap: 5px;

        width: 100%;

        padding: 5px;

        background: $secondary;

        &.widget {
            grid-template-columns: max-content 1fr;
        }

        &-visible {
            display: flex;
            align-items: center;

            padding-right: 5px;

            border-right: 1px solid #000000;

            .icon {
                width: 24px;

                stroke: #ffffff;
                stroke-width: 2px;
            }
        }

        &-name {
            justify-self: center;
        }
    }
}
</style>