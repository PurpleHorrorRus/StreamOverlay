<template>
    <div v-if="!firstLoad && !denied" id="modal-prediction-content" class="modal-content">
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
                <SolidButton v-if="!isActive" label="Начать" :load="load" :disabled="!canCreate" @clicked="start" />
                <SolidButton v-else label="Отменить" :load="load" @clicked="cancel" />
            </div>
        </div>
    </div>
    <FontAwesomeIcon v-else class="modal-load" icon="circle-notch" spin />
</template>

<script>
import Title from "~/components/menu/Title";
import Input from "~/components/settings/Input";
import Outcomes from "~/components/menu/predictions/Outcomes";
import SolidButton from "~/components/SolidButton";

import TwitchMixin from "~/mixins/twitch";

const empty = {
    title: "",
    outcomes: [{ title: "" }, { title: "" }]
};

const updateRate = 10;
let updateInterval = null;

export default {
    components: {
        Title,
        Input,
        Outcomes,
        SolidButton
    },
    mixins: [TwitchMixin],
    layout: "modal",
    data: () => ({
        prediction: empty,
        denied: false,
        firstLoad: true,
        load: false
    }),
    computed: {
        canCreate() {
            return this.prediction.title && !~this.prediction.outcomes.findIndex(o => !o.title);
        },
        isActive() {
            return this.prediction.status === "ACTIVE" || this.prediction.status === "LOCKED";
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
            const response = await this.helix.predictions.get(this.user.id);

            if (!response[0]) {
                this.denied = true;
                return this.addNotification({
                    // eslint-disable-next-line max-len
                    text: "Для использования этой функции необходимо сгенерировать новый Access Token в настройках Twitch",
                    color: "red",
                    handle: 15
                });
            }

            const [prediction] = response;
            if (prediction.status === "ACTIVE" || prediction.status === "LOCKED") {
                this.prediction = prediction;
            }
        },
        async start() {
            this.load = true;

            this.prediction = await this.helix.predictions.create(
                this.user.id,
                this.prediction.title,
                this.prediction.outcomes,
                60
            );

            updateInterval = setInterval(() => this.get(), updateRate * 1000);

            this.load = false;
        },
        async end(index) {
            if (this.isActive) {
                this.load = true;

                await this.helix.predictions.end(this.user.id, this.prediction.id, "RESOLVED", {
                    winning_outcome_id: this.prediction.outcomes[index].id
                });

                this.prediction = empty;
                this.clear();
                this.load = false;
            }
        },
        async cancel() {
            this.load = true;
            await this.helix.predictions.end(this.user.id, this.prediction.id, "CANCELED");
            this.prediction = empty;
            this.clear();
            this.load = false;
        },
        clear() {
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
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