<template>
    <div class="modal-edit-content">
        <div class="modal-title">
            <span class="modal-title-text" v-text="'Редактирование виджетов'" />
        </div>
        <div id="modal-navigation">
            <div id="modal-navigation-widgets-list">
                <div 
                    v-for="(_widget, index) of widgets" 
                    :key="_widget.id + index" 
                    class="modal-navigation-item" 
                    :class="{ 'item-active': _widget.id === widget.id }" 
                    @click="select(index)"
                >
                    <span 
                        class="modal-navigation-item-text nowrap" 
                        v-text="_widget.name" 
                    />
                </div>
            </div>
            <div id="modal-navigation-actions">
                <SolidButton
                    :label="'Добавить'"
                    @clicked="add"
                />
                <SolidButton
                    :label="'Удалить'"
                    :disabled="disabled"
                    @clicked="del"
                />
            </div>
        </div>
        <div v-if="widget" id="modal-navigation-content">
            <Input
                :value="widget.name"
                :placeholder="'Название'"
                @input="changeName"
            />
            <Input
                :value="widget.src"
                :placeholder="'Ссылка'"
                @input="changeSrc"
            />
            <span v-if="error" class="error" v-text="error" />
            
            <SolidButton
                :label="'Сохранить'"
                :disabled="disabled"
                @clicked="save"
            />
        </div>
    </div>
</template>

<script>
import Input from "~/components/settings/Input";
import SolidButton from "~/components/SolidButton";

import WidgetsMixin from "~/mixins/widgets";
import other from "~/mixins/other";

export default {
    components: {
        Input,
        SolidButton
    },
    mixins: [WidgetsMixin, other],
    layout: "modal",
    data: () => ({
        widget: null,
        error: ""
    }),
    computed: {
        disabled () {
            return this.widget.name.length === 0 ||
                    this.widget.src.length === 0;
        }
    },
    async created () {
        if (this.widgets.length) {
            this.widget = this.widgets[0];
        }
    },
    methods: {
        empty () {
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
        select (index) { 
            this.widget = this.widgets[index];
        },
        add () { 
            this.widget = this.empty();
        },
        del () {
            const index = this.widgets.findIndex(o => o.id === this.widget.id);
            if (~index) {
                const temp = [...this.widgets];
                temp.splice(index, 1);
                this.widgets = temp;
                this.widget = this.empty();
            }
        },
        changeName (value) {
            this.widget.name = value;
        },
        changeSrc (value) {
            this.widget.src = value;
        },
        save () {
            const index = this.widgets.findIndex(o => o.id === this.widget.id);

            if (~index) {
                this.widgets[index] = this.widget;
            } else {
                this.widgets = [...this.widgets, this.widget];
            }

            this.saveWidgets(this.widgets);
        }
    }
};
</script>

<style lang="scss">
#modal {
    .modal-edit-content {
        display: grid;
        grid-template-columns: 200px 1fr;
        grid-template-rows: 30px 1fr;
        gap: 1px 1px;
        grid-template-areas:
            "modal-title modal-title"
            "modal-navigation modal-navigation-content";

        .modal-title {
            grid-area: modal-title;
        }

        #modal-navigation {
            grid-area: modal-navigation;

            &-widgets-list {
                height: 100px;

                overflow: auto;
            }

            &-actions {
                display: flex;
                justify-content: space-evenly;
                justify-items: flex-start;
                align-items: center;
            }

            .modal-navigation-item {
                &:not(.item-active) {
                    &:hover {
                        cursor: pointer;
                        background: $secondary;
                    }
                }

                &-text {
                    display: block;
                    width: 100%;
                        
                    padding: 5px;

                    font-size: 10pt;
                }
            }
        }

        #modal-navigation-content {
            grid-area: modal-navigation-content;

            display: flex;
            justify-content: flex-end;
            align-content: center;
            align-items: center;
            flex-wrap: wrap;

            padding-left: 10px;
        }
    }
}

#save {
    float: right;
    margin-top: 2%;
}

.item-active {
    background: $outline;
}

.add-new {
    margin-top: 3%;
}
</style>