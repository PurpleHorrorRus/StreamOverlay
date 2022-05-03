<template>
    <div id="meta-info">
        <Viewers v-if="settings.OBSStatus.ServiceInfo.enable" />
        <Followers v-if="settings.OBSStatus.ServiceInfo.followers" />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    components: {
        Viewers: () => import("~/components/OBS/Information/Viewers"),
        Followers: () => import("~/components/OBS/Information/Followers")
    },

    mixins: [CoreMixin]
};
</script>

<style lang="scss">
#meta-info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    column-gap: 5px;

    border-radius: 2px;

    &-viewers,
    &-followers {
        @include obs-item;

        display: flex;
        align-items: center;
        column-gap: 5px;

        width: max-content;

        padding: 5px 8px 5px 5px;

        span {
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            font-family: "Roboto Condensed";
        }
    }
}
</style>