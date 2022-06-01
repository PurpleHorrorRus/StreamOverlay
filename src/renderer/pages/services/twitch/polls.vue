<template>
    <div
        v-if="!firstLoad && !denied"
        id="modal-polls-content"
        class="modal-content"
    >
        <Title id="modal-polls-title" title="Голосование" />
        <div id="modal-polls-content-container">
            <div id="modal-polls-content-container-inputs">
                <Input
                    :value="poll.title"
                    :placeholder="'Название голосования'"
                    :disabled="isActive"
                    :maxLength="60"
                    @input="poll.title = $event"
                />

                <div id="modal-polls-content-container-inputs-choices">
                    <Input
                        v-for="(choice, index) of poll.choices"
                        :key="index"
                        :value="choice.title"
                        :placeholder="choiceLabel(index)"
                        :disabled="isActive"
                        :maxLength="25"
                        @input="setChoice(index, $event)"
                    />
                </div>
            </div>

            <div id="modal-polls-content-container-buttons">
                <SolidButton
                    v-if="!isActive"
                    label="Начать"
                    :load="load"
                    :disabled="!canCreate"
                    @click.native="start"
                />

                <SolidButton
                    v-else
                    label="Закончить"
                    :load="load"
                    @click.native="end"
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
    choices: Array(5).fill({ title: "" })
};

const updateRate = 10;
let updateInterval = null;

export default {
    mixins: [CoreMixin],

    layout: "modal",

    data: () => ({
        poll: empty,
        denied: false,
        firstLoad: true,
        load: false
    }),

    computed: {
        validChoices() {
            return this.poll.choices.filter(choice => choice.title);
        },

        canCreate() {
            return  this.poll.title.length > 0 
                && this.validChoices.length >= 2;
        },

        isActive() {
            return this.poll.status === "ACTIVE";
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
        setChoice(index, value) {
            this.$set(this.poll.choices, index, {
                ...this.poll.choices[index],
                title: value
            });
        },
    
        async get() {
            const [poll] = await this.client.polls.get(this.user.id);

            if (poll?.status === "ACTIVE") {
                for (let i = 0; i < poll.choices.length; i++) {
                    poll.choices[i].title = `${poll.choices[i].title}. Проголосовало: ${poll.choices[i].votes}`;
                }

                this.poll = poll;
            }
        },
    
        async start() {
            this.load = true;
            this.poll = await this.client.polls.create(this.user.id, this.poll.title, this.validChoices, 60);
            updateInterval = setInterval(() => this.get(), updateRate * 1000);
            this.load = false;
        },

        async end() {
            this.load = true;
            await this.client.polls.end(this.user.id, this.poll.id);
            this.poll = empty;
            this.clear();
            this.load = false;
        },

        clear() {
            clearInterval(updateInterval);
            updateInterval = null;
        },

        choiceLabel(index) {
            return index < 2
                ? `Вариант №${index + 1}`
                : `Вариант №${index + 1} (необязательно)`;
        }
    }
};
</script>

<style lang="scss">
#modal-polls-content {
    &-container {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: max-content 40px;
        grid-template-areas:
            "inputs"
            "buttons";

        row-gap: 10px;

        &-inputs {
            grid-area: inputs;
        }

        &-buttons {
            grid-area: buttons;

            justify-self: flex-end;
        }
    }
}
</style>