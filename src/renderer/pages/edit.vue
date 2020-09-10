<template>
    <div class="modal-edit-content">
        <div class="modal-title">
            <span class="modal-title-text" v-text="'Редактирование виджетов'" />
        </div>
        <div id="modal-navigation">
            <div 
                v-for="(_overlay, index) of overlays" 
                :key="_overlay.id + index" 
                class="modal-navigation-item" 
                :class="{ 'item-active': _overlay.id === overlay.id }" 
                @click="select(index)"
            >
                <span 
                    class="modal-navigation-item-text nowrap" 
                    v-text="_overlay.name" 
                />
            </div>
            <button class="add-new" @click="add" v-text="'Добавить'" />
            <button class="add-new" @click="del" v-text="'Удалить'" />
        </div>
        <div v-if="overlay" id="modal-navigation-content">
            <input 
                v-model="overlay.name" 
                type="text" class="overlay_name" 
                placeholder="Название"
                style="background: none"
            >
            <input 
                v-model="overlay.src" 
                type="text" 
                placeholder="Ссылка"
                class="overlay_src"
            >
            <span v-if="error" class="error" v-text="error" />
            <button id="save" @click="save" v-text="'Сохранить'" />
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import other from "~/mixins/other";

export default {
    mixins: [other],
    layout: "modal",
    data: () => ({
        overlay: null,
        error: ""
    }),
    computed: {
        ...mapGetters({
            overlays: "overlays/getOverlays"
        }),
        empty() {
            return {
                id: (Math.random() * 1000).toFixed(0),
                name: "",
                src: "",
                style: {
                    left: 200,
                    top: 200,
                    width: 200,
                    height: 200
                }
            };
        }
    },
    created () {
        if (this.overlays.length) {
            this.overlay = this.overlays[0];
        }
    },
    methods: {
        ...mapActions({
            setOverlays: "overlays/setOverlays",
            saveOverlays: "overlays/saveOverlays"
        }),
        active (id) { 
            this.overlay.id === id; 
        },
        select (index) { 
            this.overlay = this.overlays[index]; 
        },
        add () { 
            this.overlay = this.empty;
        },
        del () {
            const index = this.overlays.findIndex(r => r.id == this.overlay.id);
            if (!~index) {
                return this.error = "Нельзя удалить недобавленный оверлей";
            }

            this.overlays.splice(index, 1);
            this.setOverlays(this.overlays);

            if (this.overlays.length) {
                if (!index) this.overlay = this.overlays[0];
                else this.overlay = this.overlays[index - 1];
            } else this.overlay = this.empty;

            return this.saveOverlays(this.overlays);
        },
        save () {
            if (!this.overlay.name.length || !this.overlay.src.length) {
                return this.error = "Все поля должны быть заполнены";
            }

            const index = this.overlays.findIndex(r => r.id == this.overlay.id);
            if (!~index) {
                this.setOverlays([...this.overlays, this.overlay]);
            }
            else {
                this.overlays[index] = this.overlay;
                this.setOverlays(this.overlays);
            }
            this.saveOverlays(this.overlays);
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