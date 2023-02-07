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

        return this.config.widgets.length > 0
            && this.select(0);
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
            this.widget = this.config.widgets[index];
            return this.widget;
        },

        add() {
            this.widget = this.empty();
            return this.widget;
        },

        delete() {
            const index = this.config.widgets.findIndex(widget => {
                return widget.id === this.widget.id;
            });

            this.widget = this.empty();

            this.config.widgets.splice(index, 1);
            return this.config.save("widgets");
        },

        saveWidget() {
            const index = this.config.widgets.findIndex(widget => {
                return widget.id === this.widget.id;
            });

            !~index
                ? this.config.widgets.push(this.widget)
                : (this.config.widgets[index] = this.widget);

            return this.config.save("widgets");
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