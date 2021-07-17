<template>
    <div v-if="!firstLoad && !denied" id="modal-polls-content" class="modal-content">
        <Title id="modal-polls-title" title="Голосование" />
        <div id="modal-polls-content-container">
            <div id="modal-polls-content-container-inputs">
                <Input
                    :value="poll.title"
                    :placeholder="'Название голосования'"
                    :disabled="isActive"
                    @input="poll.title = $event"
                />
                <div id="modal-polls-content-container-inputs-choices">
                    <Input
                        v-for="(choice, index) of poll.choices"
                        :key="index"
                        :value="!isActive ? choice.title || '' : `${choice.title} (Проголосовало: ${choice.votes})`"
                        :placeholder="index < 2 ? `Вариант №${index + 1}` : `Вариант №${index + 1} (необязательно)`"
                        :disabled="isActive"
                        @input="setChoice(index, $event)"
                    />
                </div>
            </div>
            <div id="modal-polls-content-container-buttons">
                <SolidButton v-if="!isActive" label="Начать" :load="load" :disabled="!canCreate" @clicked="start" />
                <SolidButton v-else label="Закончить" :load="load" @clicked="end" />
            </div>
        </div>
    </div>
    <FontAwesomeIcon v-else class="modal-load" icon="circle-notch" spin />
</template>

<script>
import Title from "~/components/menu/Title";
import Input from "~/components/settings/Input";
import SolidButton from "~/components/SolidButton";

import TwitchMixin from "~/mixins/twitch";

const empty = {
    title: "",
    choices: Array(5).fill({ title: "" })
};

const updateRate = 10;
let updateInterval = null;

export default {
    components: {
        Title,
        Input,
        SolidButton
    },
    mixins: [TwitchMixin],
    layout: "modal",
    data: () => ({
        poll: empty,
        denied: false,
        firstLoad: true,
        load: false
    }),
    computed: {
        canCreate() {
            return this.poll.title.length > 0 && this.poll.choices.filter(c => c.title).length >= 2;
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
            const response = await this.helix.polls.get(this.user.id);

            if (!response.poll) {
                this.denied = true;
                return this.addNotification({
                    text: "Для использования этой функции необходимо сгенерировать новый API ключ в настройках Twitch",
                    color: "red",
                    handle: 15
                });
            }

            const [poll] = response;
            if (poll.status === "ACTIVE") {
                if (poll.choices.length < 5) {
                    for (let i = poll.choices.length; i < 5; i++) {
                        poll.choices[i] = "";
                    }
                }

                this.poll = poll;
            }
        },
        async start() {
            this.load = true;
            this.poll = await this.helix.polls.create(this.user.id, this.poll.title, this.poll.choices, 60);

            updateInterval = setInterval(() => this.get(), updateRate * 1000);
            this.load = false;
        },
        async end() {
            this.load = true;
            await this.helix.polls.end(this.user.id, this.poll.id);
            this.poll = empty;
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
#modal-polls-content {
    &-container {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: max-content 40px;
        grid-template-areas:
            "inputs"
            "buttons";

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