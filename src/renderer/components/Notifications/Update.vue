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
import { mapState } from "vuex";

export default {
    data: () => ({
        percent: 0
    }),

    computed: {
        ...mapState({
            release: state => state.notifications.update.release
        }),

        line() {
            return {
                width: `${this.percent}%`
            };
        }
    },

    created() {
        ipcRenderer.on("download-progress", (_, progress) => {
            this.percent = Math.round(progress.percent);
        });
    }
};
</script>

<style lang="scss">
#update {
    display: grid;
    grid-template-columns: 40px 1fr;
    grid-template-rows: 20px max-content;
    grid-template-areas:
        "progress label"
        "release release";

    background: var(--backdrop);

    gap: 10px;

    &-progress {
        grid-area: progress;

        display: flex;
        flex-direction: column;
        row-gap: 2px;

        &-percent {
            width: 100%;

            font-size: 12px;
            text-align: center;
        }

        &-line {
            height: 2px;

            background-color: var(--secondary);
        }
    }

    &-label {
        grid-area: label;

        align-self: center;
    }

    &-release {
        grid-area: release;

        display: flex;
        flex-direction: column;
        row-gap: 5px;

        &-notes {
            font-size: 12px;

            ul {
                padding-left: 10px;

                li {
                    margin-top: 5px;
                }
            }

            h1, h2, h3, h4, h5, h6 {
                &:not(:first-child) {
                    margin-top: 15px;
                }
            }
        }
    }
}
</style>