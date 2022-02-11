<template>
    <div id="menu-header-actions-ad">
        <Button
            v-for="(_, index) of 6"
            :key="index"
            :label="`${(index + 1) * 30}`"
            :icon="['fa', 'play']"
            :load="$parent.loadAd"
            :tooltip="`Реклама на ${(index + 1) * 30} секунд`"
            @clicked="startAd(index)"
        />
    </div>
</template>

<script>
import Button from "~/components/Menu/Header/Button";

import TwitchMixin from "~/mixins/twitch";

export default {
    components: {
        Button
    },
    mixins: [TwitchMixin],
    methods: {
        async startAd(index) {
            const duration = (index + 1) * 30;
            this.$parent.loadAd = true;
            await this.helix.commercial.start(this.user.id, duration);

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