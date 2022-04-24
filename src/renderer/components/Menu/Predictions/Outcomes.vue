<template>
    <div id="modal-prediction-content-container-outcomes">
        <div v-if="!$parent.isActive" id="modal-prediction-content-container-outcomes-inputs">
            <Input
                :disabled="$parent.isActive"
                placeholder="Первый вариант"
                :maxLength="25"
                :value="$parent.prediction.outcomes[0].title"
                @input="$parent.prediction.outcomes[0].title = $event"
            />
            <Input
                :disabled="$parent.isActive"
                placeholder="Второй вариант"
                :maxLength="25"
                :value="$parent.prediction.outcomes[1].title"
                @input="$parent.prediction.outcomes[1].title = $event"
            />
        </div>
        <div v-else id="modal-prediction-content-container-outcomes-choosing">
            <Outcome
                v-for="(outcome, index) of $parent.prediction.outcomes"
                :key="outcome.id"
                :outcome="outcome"
                @click.native="$parent.end(index)"
            />
        </div>
    </div>
</template>

<script>
import Outcome from "~/components/Menu/Predictions/Outcome";

export default {
    components: {
        Outcome
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
        column-gap: 5px;
    }

    &-choosing {
        justify-content: space-evenly;
    }
}
</style>