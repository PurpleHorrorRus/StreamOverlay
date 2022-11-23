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
        Viewers: () => import("./Information/Viewers.vue"),
        Followers: () => import("./Information/Followers.vue")
    },

    mixins: [CoreMixin]
};
</script>

<style lang="scss">
#obs-content.mini {
    #meta-info {
        column-gap: 10px;

        .icon {
            height: 24px;
        }
    }
}

#meta-info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    column-gap: 5px;

    &-viewers,
    &-followers {
        @include obs-item;

        display: flex;
        align-items: center;
        column-gap: 5px;

        width: max-content;

        padding: 5px 8px 5px 5px;

        span {
            color: #ffffff;
            font-size: 13px;
            font-weight: 600;

            top: 0px !important;
        }
    }
}
</style>