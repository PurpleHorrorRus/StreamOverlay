<template>
    <div class="header-button">
        <SolidButton
            v-tooltip="tooltip"
            :label="label"
            :load="load"
            :icon="icon"
            :disabled="disabled"
            @clicked="$emit('clicked')"
        />
    </div>
</template>

<script>
import SolidButton from "~/components/SolidButton";

export default {
    components: {
        SolidButton
    },
    props: {
        ...SolidButton.props,
        tooltip: {
            type: String,
            required: false,
            default: ""
        }
    }
};
</script>

<style lang="scss">
.header-button {
    .solid-button {
        min-width: 0px;
        min-height: 0px;

        width: 40px;
        height: 22px;

        &-text {
            position: relative;
            bottom: 3px;

            font-size: 7pt;

            white-space: nowrap;
        }

        .fa-circle-notch {
            position: relative;
            bottom: 4px;
        }
    }
}
</style>