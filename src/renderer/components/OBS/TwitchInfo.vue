<template>
    <div id="meta-info">
        <Viewers v-if="settings.OBSStatus.TwitchInfo.enable" />
        <Followers v-if="settings.OBSStatus.TwitchInfo.enableFollowers" />
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
    column-gap: 10px;

    border-radius: 2px;

    &-viewers,
    &-followers {
        display: flex;
        align-items: center;
        column-gap: 4px;

        span {
            color: #fff;
            font-size: 11px;
        }
    }
}
</style>