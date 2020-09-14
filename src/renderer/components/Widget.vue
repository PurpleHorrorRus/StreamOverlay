<template>
    <Movable 
        class="widget"
        :source="widget.style" 
        :name="widget.name" 
        @onDrag="onDrag" 
        @onResize="onResize"
    />
</template>

<script>
import { ipcRenderer } from "electron-better-ipc";

import Movable from "~/components/Movable";

export default {
    components: { Movable },
    props: {
        widget: {
            type: Object,
            required: true
        }
    },
    methods: {
        onResize (x, y, width, height) {
            this.widget.style.width = width;
            this.widget.style.height = height;
            this.onDrag(x, y);
        },
        onDrag (x, y) {
            this.widget.style.x = x;
            this.widget.style.y = y;

            ipcRenderer.send("editWidget", this.widget);
        }
    }
};
</script>

<style lang="scss">
.widget {
    position: absolute;
}
</style>