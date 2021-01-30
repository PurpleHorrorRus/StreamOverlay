<template>
    <Movable
        :source="settings.TechInfo"
        :name="'Техническая информация'"
        @onDrag="onDrag"
        @onResize="onResize"
    >
        <div id="tech-info">
            <TechInfoItem
                v-if="status.stream"
                :label="'Bitrate'"
                :value="formatBitrate"
                :valueStyle="bitrateStyle"
            />
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
                :label="'Encoding'"
                :value="formatEncoding"
            />
            <TechInfoItem
                v-if="status.stream || status.recording"
                :label="'Network'"
                :value="formatNetwork"
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
        formatBitrate () {
            return `${(this.status.bitrate / 1024).toFixed(1)} MB/s`;
        },
        bitrateStyle () {
            return {
                color: this.status.bitrate < 200 ? "red" : "#fff"
            };
        },
        formatFPS () {
            return this.status.tech.fps.toFixed(0);
        },
        formatFrametime () {
            return `${this.status.tech["average-frame-time"].toFixed(2)} ms`;
        },
        formatEncoding () {
            return `${this.status.tech["render-missed-frames"]} / ${this.status.tech["render-total-frames"]}`;
        },
        formatNetwork () {
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