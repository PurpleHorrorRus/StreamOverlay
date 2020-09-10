<template>
    <div class="modal-content">
        <div class="modal-title">
            <span class="modal-title-text" v-text="'Редактирование оверлеев'" />
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
                    class="modal-navigation-item-text" 
                    v-text="_overlay.name" 
                />
            </div>
            <button id="add-new" @click="add" v-text="'Добавить'" />
            <button id="add-new" @click="del" v-text="'Удалить'" />
        </div>
        <div v-if="overlay" id="modal-navigation-content">
            <input v-model="overlay.name" type="text" class="overlay_name" style="background: none">
            <input v-model="overlay.src" type="text" class="overlay_src">
            <span v-if="error" class="error" v-text="error" />
            <button id="save" @click="save" v-text="'Сохранить'" />
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

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
        add() { 
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
        save() {
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

<style>
#modal {
    width: 680px;
}
#modal-navigation {
    float: left;
    width: 200px;
    height: 51%;
    border-right: 1px solid #ccc;
    overflow: auto;
    height: 110px;
    max-height: 110px;
}

#modal-navigation-content {
    float: right;
    width: 445px;
}

.modal-navigation-item:hover {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.2);
}

.modal-navigation-item-text {
    font-size: 10pt;
    display: block;
    white-space: nowrap;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 5px;
}

#save {
    float: right;
    margin-top: 2%;
}

.item-active {
    background: rgba(255, 255, 255, 0.2);
}

#add-new {
    margin-top: 3%;
}
</style>