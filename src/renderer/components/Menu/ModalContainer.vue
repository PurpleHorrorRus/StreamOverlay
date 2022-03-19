<template>
    <div id="modal-locked-container">
        <Navigation v-show="!settings.first" />
        <div id="modal-locked-container-page">
            <nuxt />
        </div>
    </div>
</template>

<script>
import Navigation from "~/components/Menu/Navigation";

import CoreMixin from "~/mixins/core";

export default {
    components: {
        Navigation
    },

    mixins: [CoreMixin]
};
</script>

<style lang="scss">
#modal-locked-container {
    display: grid;
    grid-template-columns: 50px 900px;
    grid-template-rows: 1fr;
    grid-template-areas: "items page";
    grid-gap: 20px 10px;

    min-width: 600px;
    height: max-content;

    background: $primary;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

    z-index: 100;

    &-page {
        grid-area: page;
        width: 98%;
    }
}
</style>