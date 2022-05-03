import Vue from "vue";

const components = {
    Title: () => import("~/components/Menu/Title"), 
    Input: () => import("~/components/Settings/Input"),
    SolidButton: () => import("~/components/SolidButton"),
    Movable: () => import("~/components/Movable"),

    LoaderIcon: () => import("~/assets/icons/loader.svg")
};

Object.entries(components).forEach(([name, component]) => {
    Vue.component(name, component);
});