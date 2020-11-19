<template>
    <Movable
        :source="settings.TechInfo"
        :name="'Техническая информация'"
        @onDrag="onDrag"
        @onResize="onResize"
    >
        <div id="tech-info">
            <TechInfoItem
                :label="'FPS'"
                :value="formatFPS"
                :valueStyle="FPSStyle"
            />
            <TechInfoItem
                :label="'Frametime'"
                :value="formatFrametime"
            />
            <TechInfoItem
                :label="'Rendering'"
                :value="formatRender"
            />
            <TechInfoItem
                v-if="status.stream || status.recording"
                :label="'Encoding'"
                :value="formatEncoding"
            />
            <TechInfoItem
                :label="'CPU Usage'"
                :value="formatCPU"
            />
            <TechInfoItem
                :label="'Memory Usage'"
                :value="formatMemory"
            />
        </div>
    </Movable>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import Movable from "~/components/Movable";
import TechInfoItem from "~/components/obs/TechInfoItem";

export default {
    components: {
        Movable,
        TechInfoItem
    },
    computed: {
        ...mapGetters({
            settings: "settings/getSettings",

            status: "obs/getStatus"
        }),
        formatFPS () {
            return this.status.tech.fps.toFixed(0);
        },
        formatFrametime () {
            return `${this.status.tech["average-frame-time"].toFixed(2)} ms`;
        },
        formatRender () {
            return `${this.status.tech["render-missed-frames"]} / ${this.status.tech["render-total-frames"]}`;
        },
        formatEncoding () {
            return `${this.status.tech["output-skipped-frames"]} / ${this.status.tech["output-total-frames"]}`;
        },
        formatCPU () {
            return this.status.tech["cpu-usage"]
                ? this.status.tech["cpu-usage"].toFixed(2) + "%"
                : "-";
        },
        formatMemory () {
            return `${this.status.tech["memory-usage"].toFixed(1)} MB`;  
        },
        FPSStyle () {
            return {
                color: this.status.tech.fps < this.status.videoSettings.fps ? "red" : "#fff"
            };
        }
    },
    methods: {
        ...mapActions({
            saveSettings: "settings/saveSettings"
        }),
        onResize (x, y, width, height) {
            this.settings.TechInfo.width = width;
            this.settings.TechInfo.height = height;
            
            this.onDrag(x, y);
        },
        onDrag (x, y) {
            this.settings.TechInfo.x = x;
            this.settings.TechInfo.y = y;
            this.saveSettings({
                type: "settings",
                content: this.settings
            });
        }
    }
};
</script>

<style lang="scss">
#tech-info {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;

    width: 100%;

    padding: 10px;

    background: #00000080;
}
</style>