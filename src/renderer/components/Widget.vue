<template>
    <Movable
        ref="widget"
        class="widget"
        :source="widget.style"
        :name="widget.name"
        :visible="widget.visible"
        @onDrag="onDrag"
        @onResize="onResize"
        @turnVisible="turnVisible"
    >
        <WebView v-if="widget.visible" :src="widget.src" />
    </Movable>
</template>

<script>
import Movable from "~/components/Movable";
import WebView from "~/components/WebView";

import WidgetsMixin from "~/mixins/widgets";

export default {
    components: { 
        Movable,
        WebView
    },
    mixins: [WidgetsMixin],
    props: {
        widget: {
            type: Object,
            required: true
        }
    },
    mounted () {
        if (this.widget.visible === undefined) {
            this.$set(this.widget, "visible", true);
            this.widgets.find(w => w.id === this.widget.id).visible = true;
            this.saveWidgets(this.widgets);
        }
    },
    methods: {
        onResize (x, y, width, height) {
            const index = this.widgets.findIndex(r => r.id === this.widget.id);
            this.widgets[index].style.width = width;
            this.widgets[index].style.height = height;
            this.onDrag(x, y, index);
        },
        onDrag (x, y, index = this.widgets.findIndex(r => r.id === this.widget.id)) {
            this.widgets[index].style.x = x;
            this.widgets[index].style.y = y;
            this.saveWidgets(this.widgets);
        },
        turnVisible() {
            this.widgets.find(w => w.id === this.widget.id).visible = !this.widget.visible;
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