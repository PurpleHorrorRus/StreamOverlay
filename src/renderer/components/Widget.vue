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
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0"
            webpreferences="allowRunningInsecureContent"
            disablewebsecurity
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
            const index = this.widgets.findIndex(r => r.id === this.widget.id);
            this.widgets[index].style = { x, y, width, height };
            this.onDrag(x, y, index);
        },
        onDrag (x, y, index = this.widgets.findIndex(r => r.id === this.widget.id)) {
            this.widgets[index].style.x = x;
            this.widgets[index].style.y = y;

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