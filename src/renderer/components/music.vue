<template>
    <div id="music">
        <span id="meridius-song" v-text="current" />
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    computed: {
        ...mapGetters({
            current: "meridius/GET_CURRENT"
        })
    }
};
</script>

<style>
#music {
    display: block;
    position: absolute;
    bottom: 5px;
    left: 5px;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}
</style>