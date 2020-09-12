<template>
    <movable :source="overlay.style" :name="overlay.name" @onDrag="onDrag" @onResize="onResize">
        <webview 
            ref="webview" 
            class="webview" 
            audioMuted="true"
            :src="overlay.src" 
            style="width: 100%; height: 100%;" 
        />
    </movable>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import movable from "~/components/movable";
import other from "~/mixins/other";

export default {
    components: { movable },
    mixins: [other],
    props: {
        overlay: {
            type: Object,
            required: true
        }
    },
    computed: { 
        ...mapGetters({ 
            overlays: "overlays/getOverlays" 
        }) 
    },
    mounted() {
        const webviews = document.getElementsByClassName("webview");
        for (const wv of webviews) {
            wv.addEventListener("dom-ready", () => 
                wv.audioMuted = true
            );
        }
        return;
    },
    methods: {
        ...mapActions({ 
            saveOverlays: "overlays/saveOverlays" 
        }),
        onResize (x, y, width, height) {
            this.overlay.style.width = width;
            this.overlay.style.height = height;
            this.onDrag(x, y);
        },
        onDrag (x, y) {
            this.overlay.style.left = x;
            this.overlay.style.top = y;

            const index = this.overlays.findIndex(r => r.id === this.overlay.id);
            this.overlays[index] = this.overlay;

            this.saveOverlays(this.overlays);
        }
    }
};
</script>

<style>
.overlay { 
    position: absolute; 
}
</style>