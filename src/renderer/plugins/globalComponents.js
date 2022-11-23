import Vue from "vue";

const components = {
    Title: () => import("~/components/Menu/Title.vue"),
    MenuLink: () => import("~/components/Menu/Link.vue"),
    ModalCategory: () => import("~/components/Settings/Category.vue"),
    Input: () => import("~/components/Settings/Input.vue"),
    ToggleButton: () => import("~/components/Settings/Item.vue"),
    Range: () => import("~/components/Settings/Range.vue"),
    SolidButton: () => import("~/components/SolidButton.vue"),
    Movable: () => import("~/components/Movable.vue"),

    LoaderIcon: () => import("~icons/loader.svg")
};

Object.entries(components).forEach(([name, component]) => {
    Vue.component(name, component);
});