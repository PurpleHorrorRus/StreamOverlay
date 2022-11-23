<template>
    <div
        v-tooltip="tooltip"
        class="prediction-outcome"
        :style="outcomeStyle"
    >
        <span class="prediction-outcome-title" v-text="outcome.title" />
        <span class="prediction-outcome-users" v-text="users" />
        <span class="prediction-outcome-points" v-text="points" />
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
        },

        tooltip() {
            return this.$i18n(
                this.$strings.MENU.PREDICTIONS.OUTCOME.CHOOSE,
                "title",
                this.outcome.title
            );
        },

        users() {
            return this.$i18n(
                this.$strings.MENU.PREDICTIONS.OUTCOME.USERS,
                "users",
                this.outcome.users
            );
        },

        points() {
            return this.$i18n(
                this.$strings.MENU.PREDICTIONS.OUTCOME.POINTS,
                "points",
                this.outcome.channel_points
            );
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