<template>
    <div class="progress">
        <div class="progress-line" :style="lineStyle" />
        <span class="progress-percent" v-text="percent + '%'" />
    </div>
</template>

<script>
export default {
    props: {
        percent: {
            type: Number,
            required: true
        }
    },
    computed: {
        lineStyle() {
            return {
                width: this.percent + "%"
            };
        }
    }
};
</script>

<style lang="scss">
.progress {
    display: grid;
    grid-template-columns: 1fr 40px;
    grid-template-rows: max-content;
    align-items: center;
    column-gap: 10px;

    &-line {
        height: 2px;

        background: $secondary;
        border-radius: 4px;
    }

    &-percent {
        color: $small-text;
        font-size: 12px;
    }
}
</style>