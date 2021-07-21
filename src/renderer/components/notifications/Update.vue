<template>
    <div id="update" class="notification icon">
        <div id="update-progress">
            <span id="update-progress-percent" v-text="`${percent}%`" />
            <div id="update-progress-line" :style="line" />
        </div>

        <span id="update-label" v-text="'Скачивание обновления...'" />
        <div id="update-release">
            <span id="update-release-title" v-html="release.releaseName" />
            <span id="update-release-notes" v-html="release.releaseNotes" />
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
    props: {
        release: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        percent: 0
    }),
    computed: {
        line() {
            return {
                width: `${this.percent}%`
            };
        }
    },
    created() {
        ipcRenderer.on("download-progress", (_, progress) => (this.percent = Math.round(progress.percent)));
    }
};
</script>

<style lang="scss">
#update {
    display: grid;
    grid-template-rows: 20px max-content;
    grid-template-areas:
        "progress label"
        "release release";

    background: $backdrop;

    column-gap: 10px;

    &-progress {
        grid-area: progress;

        display: flex;
        align-content: center;
        flex-wrap: wrap;
        row-gap: 2px;

        &-percent {
            justify-self: center;

            width: 100%;

            font-size: 9pt;
        }

        &-line {
            height: 2px;

            background-color: $secondary;
        }
    }

    &-label {
        grid-area: label;

        align-self: center;

        width: 85%;
    }

    &-release {
        grid-area: release;

        width: 88%;

        padding-top: 10px;

        &-notes {
            font-size: 9pt;

            ul {
                padding-left: 10px;

                li {
                    margin-top: 5px;
                }
            }
        }
    }
}
</style>