<template>
    <div class="modal-edit-content">
        <div class="modal-title">
            <span class="modal-title-text" v-text="'Редактирование виджетов'" />
        </div>
        <div id="modal-navigation">
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
            <button class="add-new" @click="add" v-text="'Добавить'" />
            <button v-if="widgets.length > 0" class="add-new" @click="del" v-text="'Удалить'" />
        </div>
        <div v-if="widget" id="modal-navigation-content">
            <input 
                v-model="widget.name" 
                type="text" class="widget_name" 
                placeholder="Название"
                style="background: none"
            >
            <input 
                v-model="widget.src" 
                type="text" 
                placeholder="Ссылка"
                class="widget_src"
            >
            <span v-if="error" class="error" v-text="error" />
            <button id="save" @click="save" v-text="'Сохранить'" />
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import { ipcRenderer } from "electron-better-ipc";

import other from "~/mixins/other";

export default {
    mixins: [other],
    layout: "modal",
    data: () => ({
        widget: null,
        widgets: [],
        error: ""
    }),
    computed: {
        empty () {
            return {
                id: (Math.random() * 1000).toFixed(0),
                name: "",
                src: "",
                style: {
                    x: 200,
                    y: 200,
                    width: 200,
                    height: 200
                }
            };
        }
    },
    async created () {
        this.widgets = await ipcRenderer.callMain("getAllWidgets");
        if (this.widgets.length) {
            this.widget = this.widgets[0];
        }
    },
    methods: {
        ...mapActions({
            saveWidgets: "overlays/saveWidgets"
        }),
        async select (index) { 
            this.widget = this.widgets[index];
        },
        add () { 
            this.widget = this.empty;
        },
        del () {
            const index = this.widgets.findIndex(o => o.id === this.widget.id);
            if (~index) {
                this.widgets.splice(index, 1);
                ipcRenderer.send("removeWidget", this.widget.id);
            }
            
        },
        save () {
            const index = this.widgets.findIndex(o => o.id === this.widget.id);

            if (~index) {
                this.widgets[index] = this.widget;
                ipcRenderer.send("editWidget", this.widget);
            } else {
                this.widgets = [...this.widgets, this.widget];
                ipcRenderer.send("addWidget", this.widget);
            }

            this.saveWidgets(this.widgets);
        }
    }
};
</script>

<style lang="scss">
#modal {
    width: 680px;

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