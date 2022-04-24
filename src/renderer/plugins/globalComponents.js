import Vue from "vue";

import Title from "~/components/Menu/Title";
import Input from "~/components/Settings/Input";
import SolidButton from "~/components/SolidButton";

import LoaderIcon from "~/assets/icons/loader.svg";

const components = {
    Title, Input, SolidButton,
    LoaderIcon
};

Object.entries(components).forEach(([name, component]) => {
    Vue.component(name, component);
});