<template>
    <div id="modal-prediction-content-container-outcomes">
        <div
            v-if="!$parent.isActive"
            id="modal-prediction-content-container-outcomes-inputs"
        >
            <Input
                v-for="outcome of $parent.prediction.outcomes"
                :key="outcome.id"
                :placeholder="outcomeTitle(outcome.id)"
                :disabled="$parent.isActive"
                :maxlength="25"
                :value="$parent.prediction.outcomes[outcome.id].title"
                @input="changeOutcome(outcome.id, $event)"
            />
        </div>

        <div v-else id="modal-prediction-content-container-outcomes-choosing">
            <Outcome
                v-for="outcome of $parent.prediction.outcomes"
                :key="outcome.id"
                :outcome="outcome"
                @click.native="$parent.end(outcome.id)"
            />
        </div>
    </div>
</template>

<script>
export default {
    components: {
        Outcome: () => import("~/components/Menu/Predictions/Outcome")
    },

    data: () => ({
        requires: 2
    }),

    methods: {
        outcomeTitle(outcome) {
            return this.$i18n(
                this.$strings.MENU.PREDICTIONS[
                    outcome < this.requires
                        ? "OUTCOME_REQUIRED"
                        : "OUTCOME_OPTIONAL"
                ],

                "outcome",
                outcome + 1
            );
        },

        changeOutcome(outcome, value) {
            this.$parent.prediction.outcomes[outcome].title = value;
            return value;
        }
    }
};
</script>

<style lang="scss">
#modal-prediction-content-container-outcomes {
    grid-area: outcomes;

    margin-top: 10px;

    &-inputs,
    &-choosing {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    &-choosing {
        justify-content: space-evenly;
    }
}
</style>