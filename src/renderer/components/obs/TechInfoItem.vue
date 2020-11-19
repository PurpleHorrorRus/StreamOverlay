<template>
    <div class="tech-info-item">
        <span class="tech-info-item-text tech-info-item-label nowrap" v-text="label" />
        <span class="tech-info-item-text tech-info-item-value nowrap" :style="valueStyle" v-text="value" />
    </div>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        valueStyle: {
            type: Object,
            required: false,
            default: () => ({})
        }
    }
};
</script>

<style lang="scss">
.tech-info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;    

    &-text {
        font-family: "Roboto Condensed" sans-serif;
        font-weight: 300;
        font-size: 9pt;
    }
}
</style>