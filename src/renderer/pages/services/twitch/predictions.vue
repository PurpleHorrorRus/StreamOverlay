<template>
    <div
        v-if="!firstLoad && !denied"
        id="modal-prediction-content"
        class="modal-content"
    >
        <Title id="modal-prediction-title" title="Предсказание" />
        <div id="modal-prediction-content-container">
            <Input
                id="modal-prediction-content-container-title"
                placeholder="Название предсказания"
                :value="prediction.title"
                :disabled="isActive"
                :maxLength="45"
                @input="prediction.title = $event"
            />

            <Outcomes />

            <div id="modal-prediction-content-container-buttons">
                <SolidButton
                    v-if="!isActive"
                    label="Начать"
                    :load="load"
                    :disabled="!canCreate"
                    @click.native="start"
                />

                <SolidButton
                    v-else
                    label="Отменить"
                    :load="load"
                    @click.native="cancel"
                />
            </div>
        </div>
    </div>

    <LoaderIcon v-else class="modal-load icon spin" />
</template>

<script>
import CoreMixin from "~/mixins/core";

const empty = {
    title: "",
    outcomes: [{ title: "" }, { title: "" }]
};

const updateRate = 10;
let updateInterval = null;

export default {
    components: {
        Outcomes: () => import("~/components/Menu/Predictions/Outcomes")
    },

    mixins: [CoreMixin],

    layout: "modal",

    data: () => ({
        prediction: empty,
        denied: false,
        firstLoad: true,
        load: false
    }),

    computed: {
        canCreate() {
            const isEmptyOutcome = this.prediction.outcomes.some(outcome => {
                return !outcome.title;
            });

            return this.prediction.title && !isEmptyOutcome;
        },

        isActive() {
            return this.prediction.status === "ACTIVE" 
                || this.prediction.status === "LOCKED";
        }
    },

    async created() {
        await this.get();

        if (this.isActive) {
            updateInterval = setInterval(() => this.get(), updateRate * 1000);
        }

        this.firstLoad = false;
    },

    beforeDestroy() {
        this.clear();
    },

    methods: {
        async get() {
            const [prediction] = await this.client.predictions.get(this.user.id);
            if (prediction.status === "ACTIVE" || prediction.status === "LOCKED") {
                this.prediction = prediction;
            }
        },

        async start() {
            this.load = true;

            // eslint-disable-next-line max-len
            this.prediction = await this.client.predictions.create(this.user.id, this.prediction.title, this.prediction.outcomes, 60);
            updateInterval = setInterval(() => this.get(), updateRate * 1000);

            this.load = false;
        },

        async end(index) {
            if (this.isActive) {
                this.load = true;

                await this.client.predictions.end(this.user.id, this.prediction.id, "RESOLVED", {
                    winning_outcome_id: this.prediction.outcomes[index].id
                });

                this.clear();
                this.load = false;
            }
        },

        async cancel() {
            this.load = true;

            await this.client.predictions.end(this.user.id, this.prediction.id, "CANCELED");
            this.clear();

            this.load = false;
        },

        clear() {
            this.prediction = empty;

            clearInterval(updateInterval);
            updateInterval = null;
        }
    }
};
</script>

<style lang="scss">
#modal-prediction-content {
    width: 100%;
    height: 100%;

    &-container {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 40px 1fr 40px;
        grid-template-areas:
            "title"
            "outcomes"
            "buttons";

        row-gap: 10px;

        &-buttons {
            grid-area: buttons;

            justify-self: flex-end;

            padding-bottom: 15px;
        }
    }
}
</style>