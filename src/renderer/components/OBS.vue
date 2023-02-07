<template>
    <Movable
        id="obs"
        class="movable-slot"
        :source="config.settings.OBSStatus"
        :resizable="false"
    >
        <div id="obs-content" :style="OBSStyle" :class="OBSClass">
            <div v-if="OBSConnected" id="obs-content-main">
                <Devices />
                <Status v-if="showStatus" />
                <OBSTech v-if="showTech" />
            </div>

            <ServiceInfo v-if="chatConnected" />
        </div>
    </Movable>
</template>

<script>
import { mapState } from "vuex";

import OBSMixin from "~/mixins/obs";

export default {
    components: {
        Devices: () => import("~/components/OBS/Devices.vue"),
        ServiceInfo: () => import("~/components/OBS/ServiceInfo.vue"),
        Status: () => import("~/components/OBS/Status.vue"),
        OBSTech: () => import("~/components/OBS/Tech.vue")
    },

    mixins: [OBSMixin],

    computed: {
        ...mapState({
            chatConnected: state => state.service.connected
        }),

        showStatus() {
            return this.streaming
                || this.recording;
        },

        showTech() {
            return this.config.settings.OBSStatus.tech;
        },

        OBSClass() {
            return {
                mini: this.config.settings.OBSStatus.mini.enable,
                connected: this.OBSConnected && !this.streaming && !this.recording,
                disconnected: !this.OBSConnected,
                streaming: this.streaming,
                recording: this.recording
            };
        },

        OBSStyle() {
            if (this.config.settings.OBSStatus.mini.enable) {
                const OBSPanelMini = this.config.settings.OBSStatus.mini;

                return {
                    background: `rgba(0, 0, 0, ${OBSPanelMini.opacity}%)`,
                    borderRadius: `${OBSPanelMini.radius}px`,
                    transform: `scale(${OBSPanelMini.scale})`,

                    border: OBSPanelMini.border
                        ? `1px solid rgba(225, 225, 225, ${Math.min(OBSPanelMini.opacity, 50)}%`
                        : "none",

                    filter: OBSPanelMini.border && OBSPanelMini.shadow
                        ? `drop-shadow(2px 2px 2px rgba(0, 0, 0, ${Math.min(OBSPanelMini.opacity, 80)}%))`
                        : "unset"
                };
            }

            return {};
        }
    },

    methods: {
        onDrag(x, y) {
            this.config.settings.OBSStatus.x = x;
            this.config.settings.OBSStatus.y = y;
            return this.config.settings.save();
        }
    }
};
</script>

<style lang="scss">
#obs {
    width: max-content !important;
    height: max-content !important;

    &-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        align-content: center;
        row-gap: 5px;

        padding: 5px;

        &.mini {
            flex-direction: row;
            align-items: center;
            column-gap: 15px;
            row-gap: 0px;

            padding: 5px 10px 5px 5px;

            -webkit-transform-origin-x: 0;

            #obs-content-main {
                column-gap: 10px;
            }

            #obs-content-main, #meta-info {
                > div, > span {
                    height: 100%;

                    padding: 0px;

                    border: none;
                    background: none;
                }

                span {
                    font-size: 1rem;
                    top: 0px;
                }
            }

            #meta-info {
                height: 100%;

                span {
                    font-size: 1rem;
                }
            }

            .icon path {
                transition: fill .2s ease-in-out;
            }
        }

        .icon {
            height: 20px;

            g, path {
                fill: #ffffff;
            }
        }

        &-main {
            display: flex;
            justify-content: center;
            align-items: center;
            align-content: center;
            column-gap: 5px;

            * {
                align-items: center;
            }

            > * {
                align-content: center;
            }
            span {
                color: #ffffff;
                font-size: 12px;
            }
        }
    }
}
</style>