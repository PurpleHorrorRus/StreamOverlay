<template>
    <div id="modal-appearance-content" class="modal-content">
        <Title
            id="modal-appearance-content-title"
            :title="$strings.MENU.APPEARANCE.TITLE"
        />

        <div class="modal-body">
            <ToggleButton
                :text="$strings.MENU.APPEARANCE.OBSPANEL.TITLE"
                :checked="settings.OBSStatus.mini.enable"
                @change="deepChange(settings.OBSStatus.mini, 'enable')"
            />

            <ModalCategory
                v-if="settings.OBSStatus.mini.enable"
                :name="$strings.MENU.APPEARANCE.OBSPANEL.SETTINGS.TITLE"
            >
                <Range
                    :text="$strings.MENU.APPEARANCE.OBSPANEL.SETTINGS.OPACITY"
                    :value="settings.OBSStatus.mini.opacity"
                    :max="100"
                    @select="changeOBSStatusValue('opacity', $event)"
                />

                <Range
                    :text="$strings.MENU.APPEARANCE.OBSPANEL.SETTINGS.RADIUS"
                    :value="settings.OBSStatus.mini.radius"
                    :max="100"
                    @select="changeOBSStatusValue('radius', $event)"
                />

                <Range
                    :text="$strings.MENU.APPEARANCE.OBSPANEL.SETTINGS.SCALE"
                    :value="Number(settings.OBSStatus.mini.scale)"
                    :max="1.5"
                    :min="0.5"
                    :step="0.01"
                    @select="changeOBSStatusValue('scale', $event)"
                />

                <ToggleButton
                    :text="$strings.MENU.APPEARANCE.OBSPANEL.SETTINGS.BORDER"
                    :checked="settings.OBSStatus.mini.border"
                    @change="deepChange(settings.OBSStatus.mini, 'border')"
                />

                <ToggleButton
                    v-if="settings.OBSStatus.mini.border"
                    :text="$strings.MENU.APPEARANCE.OBSPANEL.SETTINGS.SHADOW"
                    :checked="settings.OBSStatus.mini.shadow"
                    @change="deepChange(settings.OBSStatus.mini, 'shadow')"
                />
            </ModalCategory>
        </div>
    </div>
</template>

<script>
import CoreMixin from "~/mixins/core";

export default {
    mixins: [CoreMixin],

    layout: "modal",

    methods: {
        changeOBSStatusValue(type, value) {
            this.settings.OBSStatus.mini[type] = value;
            this.save();
        }
    }
};
</script>

<style lang="scss">
#modal-obs-content {
    &-install {
        margin: 10px 0px;
    }
}
</style>