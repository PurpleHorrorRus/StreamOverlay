import Vue from "vue";

const components = {
    Title: () => import("~/components/Menu/Title"), 
    Input: () => import("~/components/Settings/Input"),
    ToggleButton: () => import("~/components/Settings/Item"),
    Range: () => import("~/components/Settings/Range"),
    SolidButton: () => import("~/components/SolidButton"),
    Movable: () => import("~/components/Movable"),

    LoaderIcon: () => import("~/assets/icons/loader.svg")
};

Object.entries(components).forEach(([name, component]) => {
    Vue.component(name, component);
});