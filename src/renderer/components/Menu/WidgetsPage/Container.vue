<template>
    <div id="widgets-page-content-container">
        <WidgetsList />
        <WidgetEdit v-if="widget" />
    </div>
</template>

<script>
import WidgetsMixin from "~/mixins/widgets";
import OtherMixin from "~/mixins/other";

export default {
    components: {
        WidgetsList: () => import("./List.vue"),
        WidgetEdit: () => import("./Edit.vue")
    },

    mixins: [WidgetsMixin, OtherMixin],

    data: () => ({
        widget: null
    }),

    computed: {
        disabled() {
            if (this.widget) {
                return this.widget.name.length === 0
                    || this.widget.src.length === 0;
            }

            return true;
        }
    },

    created() {
        this.active = false;

        if (this.widgets.length > 0) {
            this.select(0);
        }
    },

    methods: {
        empty() {
            return {
                id: Math.floor(Date.now() / 1000),
                name: "",
                src: "",
                visible: true,
                style: {
                    x: 200,
                    y: 200,
                    width: 200,
                    height: 200
                }
            };
        },

        select(index) {
            this.widget = this.widgets[index];
        },

        add() {
            this.widget = this.empty();
        },

        delete() {
            const index = this.widgets.findIndex(widget => {
                return widget.id === this.widget.id;
            });

            const copy = [...this.widgets];
            copy.splice(index, 1);
            this.widgets = copy;
            this.widget = this.empty();
        },

        saveWidget() {
            const index = this.widgets.findIndex(widget => {
                return widget.id === this.widget.id;
            });

            !~index
                ? this.widgets.push(this.widget)
                : this.widgets[index] = this.widget;

            this.saveWidgets(this.widgets);
        }
    }
};
</script>

<style lang="scss">
#widgets-page-content-container {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: 30px 1fr;
    grid-template-areas: "navigation edit";
    grid-gap: 5px;
}
</style>