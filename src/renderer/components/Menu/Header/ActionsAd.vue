<template>
    <div id="menu-header-actions-ad">
        <SolidButton
            v-for="(_, index) of 6"
            :key="index"
            :label="`Реклама: ${(index + 1) * 30} сек.`"
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
            const duration = (index + 1) * 30;
            this.loadAd = true;
            const success = await this.client.commercial.start(this.user.id, duration)
                .catch(() => (false));
            
            if (success) {
                this.addNotification({
                    text: `Вы запустили рекламу на ${duration} секунд`,
                    color: "#28a745",
                    handle: 5
                });
            }

            this.loadAd = false;
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