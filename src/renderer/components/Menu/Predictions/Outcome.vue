<template>
    <div v-tooltip="`Выбрать ${outcome.title}`" class="prediction-outcome" :style="outcomeStyle">
        <span class="prediction-outcome-title" v-text="outcome.title" />
        <span class="prediction-outcome-users" v-text="`Пользователей: ${outcome.users}`" />
        <span class="prediction-outcome-points" v-text="`Баллов потрачено: ${outcome.channel_points}`" />
    </div>
</template>

<script>
export default {
    props: {
        outcome: {
            type: Object,
            required: true
        }
    },
    computed: {
        outcomeStyle() {
            return {
                backgroundColor: this.outcome.color
            };
        }
    }
};
</script>

<style lang="scss">
.prediction-outcome {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;

    width: 200px;
    height: 200px;

    border-radius: 5px;

    &:hover {
        border: 1px solid var(--secondary);
        
        cursor: pointer;
    }

    span {
        width: 100%;
        text-align: center;
    }

    &-title {
        font-size: 16pt;
    }

    &-users {
        font-size: 14pt;
    }

    &-points {
        font-size: 12pt;
    }
}
</style>