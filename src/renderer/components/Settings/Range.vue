<template>
    <div class="setting-item-range">
        <span class="setting-item-name" v-text="text" />

        <VueRangeComponent
            id="line"
            ref="line"
            :value="value"
            :min="min"
            :max="max"
            :tooltip="'hover'"
            :speed="0"
            :step="1"
            :height="4"
            :dot-size="8"
            :tooltip-style="{ display: 'none' }"
            @slide-end="select"
        >
            <template slot="tooltip">
                <span class="slider-tooltip" :style="tooltipStyle" v-text="value" />
            </template>
        </VueRangeComponent>

        <span 
            v-if="tip.length > 0" 
            class="modal-item-tip" 
            v-text="tip" 
        />
    </div>
</template>

<script>
export default {
    components: {
        VueRangeComponent: () => import("vue-range-component")
    },

    props: {
        value: {
            type: Number,
            required: true
        },

        min: {
            type: Number,
            required: false,
            default: 0
        },

        max: {
            type: Number,
            required: false,
            default: 100
        },

        text: {
            type: String,
            required: true,
            default: "Не задано"
        },

        checked: {
            type: Boolean,
            required: false,
            default: false
        },

        tip: {
            type: String,
            required: false,
            default: ""
        }
    },

    computed: {
        tooltipStyle () {
            return {
                backgroundColor: "#070707",
                padding: "5px",
                border: "2px solid #fff",
                borderRadius: "5px"
            };
        }
    },

    methods: {
        select (value) {
            this.$emit("select", value);
        }
    }
};
</script>

<style lang="scss">
.setting-item-range {
    margin-top: 15px;
    margin-bottom: 15px;

    .slider  {
        .slider-process {
            background-color: var(--secondary) !important;
        }
    }
}
</style>