<template>
    <div class="badges">
        <img v-for="badge of badges" :key="badge" class="badge" :style="pictureStyle" :src="badge">
    </div>
</template>

<script>
import MessageMixin from "~/components/Chat/mixin";

export default {
    mixins: [MessageMixin],
    props: {
        badges: {
            type: Array,
            required: false,
            default: () => []
        }
    }
};
</script>

<style lang="scss">
.badges {
    display: inline;

    vertical-align: middle;

    .badge {
        &:not(:last-child) {
            margin-right: 2px;
        }

        margin-left: 2px;

        border-radius: 3px;

        vertical-align: middle;
    }
}
</style>