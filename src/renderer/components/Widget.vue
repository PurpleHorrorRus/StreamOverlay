<template>
    <Movable
        :source="widget.style"
        :name="widget.name"
        :visible="widget.visible"
        @turnVisible="turnVisible"
    >
        <WebView v-if="widget.visible" :src="widget.src" class="movable-slot" />
    </Movable>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    components: {
        WebView: () => import("./WebView.vue")
    },

    mixins: [CoreMixin],

    props: {
        widget: {
            type: Object,
            required: true
        }
    },

    mounted () {
        if (this.widget.visible === undefined) {
            this.$set(this.widget, "visible", true);

            this.config.widgets.find(widget => {
                return widget.id === this.widget.id;
            }).visible = true;

            return this.config.save("widgets");
        }
    },

    methods: {
        onResize (x, y, width, height) {
            const index = this.config.widgets.findIndex(widget => {
                return widget.id === this.widget.id;
            });

            this.config.widgets[index].style.width = width;
            this.config.widgets[index].style.height = height;

            return this.onDrag(x, y, index);
        },

        onDrag (x, y, index = this.config.widgets.findIndex(r => r.id === this.widget.id)) {
            this.config.widgets[index].style.x = x;
            this.config.widgets[index].style.y = y;
            return this.config.save("widgets");
        },

        turnVisible() {
            this.config.widgets.find(widget => {
                return widget.id === this.widget.id;
            }).visible = !this.widget.visible;

            return this.config.save("widgets");
        }
    }
};
</script>