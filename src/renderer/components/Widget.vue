<template>
    <Movable 
        ref="widget"
        class="widget"
        :source="widget.style" 
        :name="widget.name" 
        @onDrag="onDrag" 
        @onResize="onResize"
    >
        <webview 
            ref="webview" 
            class="webview" 
            :src="widget.src"
        />
    </Movable>
</template>

<script>
import Movable from "~/components/Movable";

import WidgetsMixin from "~/mixins/widgets";

export default {
    components: { Movable },
    mixins: [WidgetsMixin],
    props: {
        widget: {
            type: Object,
            required: true
        }
    },
    mounted () {
        this.$refs.webview.addEventListener("dom-ready", 
            () => this.$refs.webview.setAudioMuted(true));
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

            const index = this.widgets.findIndex(r => r.id === this.widget.id);
            this.widgets[index] = this.widget;

            this.saveWidgets(this.widgets);
        }
    }
};
</script>

<style lang="scss">
.widget {
    position: absolute;

    .webview {
        width: 100%;
        height: 100%;
    }
}
</style>