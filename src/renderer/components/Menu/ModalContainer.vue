<template>
    <div id="modal-locked-container" :class="{ first: settings.first }">
        <Navigation v-if="!settings.first" />
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
    grid-template-columns: 50px 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "navigation page";
    grid-gap: 20px 10px;

    min-width: 600px;
    height: max-content;

    padding: 0px 15px 15px 0px;

    background: var(--primary);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    border-radius: 4px;

    z-index: 100;

    &.first {
        grid-template-columns: 1fr;
        grid-template-areas: "page";
        grid-gap: 0px;

        padding: 15px;
    }

    &-page {
        grid-area: page;
        width: 100%;
    }
}
</style>