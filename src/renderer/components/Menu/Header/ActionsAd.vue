<template>
    <div id="menu-header-actions-ad">
        <SolidButton
            v-for="(_, index) of 6"
            :key="index"
            :label="`Реклама: ${(index + 1) * 30} сек.`"
            :load="$parent.loadAd"
            @click.native="startAd(index)"
        />
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    methods: {
        async startAd(index) {
            const duration = (index + 1) * 30;
            this.$parent.loadAd = true;
            await this.client.commercial.start(this.user.id, duration);

            this.addNotification({
                text: `Вы запустили рекламу на ${duration} секунд`,
                color: "#28a745",
                handle: 5
            });

            this.$parent.loadAd = false;
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