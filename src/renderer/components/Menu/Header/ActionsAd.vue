<template>
    <div id="menu-header-actions-ad">
        <SolidButton
            v-for="(_, index) of 6"
            :key="index"
            :label="$i18n($strings.HEADER.TWITCH.BUTTONS.AD, 'time', (index + 1) * 30)"
            :load="loadAd"
            :disabled="loadAd"
            @click.native="startAd(index)"
        />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    data: () => ({
        loadAd: false
    }),

    methods: {
        async startAd(index) {
            this.loadAd = true;

            const duration = (index + 1) * 30;
            const success = await this.client.commercial.start(this.user.id, duration)
                .catch(() => (false));

            if (success) {
                this.addNotification({
                    text: this.$i18n(this.$strings.NOTIFICATIONS.TWITCH.AD, "duration", duration),
                    color: "#28a745",
                    handle: 5
                });
            }

            this.loadAd = false;
            return success;
        }
    }
};
</script>

<style lang="scss">
#menu-header-actions-ad {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;

    margin-top: 5px;
}
</style>