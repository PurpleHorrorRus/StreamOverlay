<template>
    <div id="modal-edit-content" class="modal-content">
        <Title id="modal-edit-content-title" title="Редактирование виджетов" />
        <div id="modal-edit-content-navigation">
            <div id="modal-edit-content-navigation-list">
                <div
                    v-for="(_widget, index) of widgets"
                    :key="_widget.id + index"
                    class="modal-navigation-item nowrap clickable"
                    :class="{ active: _widget.id === widget.id }"
                    @click="select(index)"
                >
                    <span class="modal-navigation-item-text nowrap" v-text="_widget.name" />
                    <span class="modal-navigation-item-url nowrap small-text" v-text="_widget.src" />
                </div>
            </div>
            <div id="modal-edit-content-navigation-actions">
                <SolidButton :label="'Добавить'" @clicked="add" />
                <SolidButton :label="'Удалить'" :disabled="disabled" @clicked="del" />
            </div>
        </div>
        <div v-if="widget" id="modal-edit-content-inputs">
            <Input :value="widget.name" :placeholder="'Название'" @input="changeName" />
            <Input :value="widget.src" :placeholder="'Ссылка'" @input="changeSrc" />
            <SolidButton :label="'Сохранить'" :disabled="disabled" @clicked="_save" />
        </div>
    </div>
</template>

<script>
import Title from "~/components/menu/Title";
import Input from "~/components/settings/Input";
import SolidButton from "~/components/SolidButton";

import WidgetsMixin from "~/mixins/widgets";
import other from "~/mixins/other";

export default {
    components: {
        Title,
        Input,
        SolidButton
    },
    mixins: [WidgetsMixin, other],
    layout: "modal",
    data: () => ({
        widget: null
    }),
    computed: {
        disabled() {
            if (this.widget) {
                return this.widget.name.length === 0 || this.widget.src.length === 0;
            }

            return true;
        }
    },
    async created() {
        this.active = false;

        if (this.widgets.length) {
            this.widget = this.widgets[0];
        }
    },
    methods: {
        empty() {
            return {
                id: Number((Math.random() * 1000).toFixed(0)),
                name: "",
                src: "",
                style: {
                    x: 200,
                    y: 200,
                    width: 200,
                    height: 200
                }
            };
        },
        select(index) {
            this.widget = this.widgets[index];
        },
        add() {
            this.widget = this.empty();
        },
        del() {
            const index = this.widgets.findIndex(o => o.id === this.widget.id);
            if (~index) {
                const temp = [...this.widgets];
                temp.splice(index, 1);
                this.widgets = temp;
                this.widget = this.empty();
            }
        },
        changeName(value) {
            this.widget.name = value;
        },
        changeSrc(value) {
            this.widget.src = value;
        },
        _save() {
            const index = this.widgets.findIndex(o => o.id === this.widget.id);
            ~index ? (this.widgets[index] = this.widget) : (this.widgets = [...this.widgets, this.widget]);

            this.saveWidgets(this.widgets);
        }
    }
};
</script>

<style lang="scss">
#modal-edit-content {
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-template-rows: 30px 1fr;
    grid-template-areas:
        "title title"
        "navigation inputs";
    grid-gap: 5px;

    &-title {
        grid-area: title;
    }

    &-navigation {
        grid-area: navigation;

        &-list {
            height: 215px;

            overflow-x: hidden;
            overflow-y: auto;

            .modal-navigation-item {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                flex-wrap: wrap;

                padding: 5px;

                span {
                    width: 100%;
                }
            }
        }

        &-actions {
            display: flex;
            justify-content: space-evenly;
        }
    }

    &-inputs {
        grid-area: inputs;

        .solid-button {
            margin: 10px;
        }
    }
}
</style>