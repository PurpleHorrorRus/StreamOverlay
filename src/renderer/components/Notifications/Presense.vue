<template>
    <div class="presense-notification">
        <img :src="notification.image" class="presense-notification__image" />

        <div class="presense-notification-info nowrap">
            <div class="presense-notification-info-action">
                <Component
                    :is="notification.action.icon"
                    v-if="notification.action.icon"
                    class="presense-notification-info-action__icon icon"
                />

                <span
                    class="presense-notification-info-action__text small-text"
                    v-text="notification.action.text"
                />
            </div>

            <span
                class="presense-notification-info__text"
                v-text="notification.text"
            />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        notification: {
            type: Object,
            required: true
        }
    }
};
</script>

<style lang="scss">
@keyframes presense {
    0% {
        left: 420px;
        opacity: 0;
    }

    100% {
        left: 0px;
        opacity: 1;
    }
}

.presense-notification {
    position: relative;

    display: grid;
    grid-template-columns: 100px 1fr;
    grid-template-rows: 100px;
    align-items: center;
    column-gap: 10px;

    width: 420px;

    background: #000000c2;
    border-left: 3px solid var(--secondary);

    opacity: 1;

    // animation-name: presense;
    // animation-duration: .5s;
    // animation-fill-mode: forwards;

    &__image {
        width: 100%;
        height: 100%;

        object-fit: cover;
    }

    &-info {
        display: flex;
        align-self: flex-start;
        flex-direction: column;
        row-gap: 5px;

        padding: 10px;

        &-action {
            display: flex;
            align-items: center;
            flex-direction: row;
            column-gap: 5px;

            &__icon {
                width: 16px;

                path {
                    stroke: var(--small-text);
                    fill: var(--small-text);
                }
            }

            &__text {
                font-size: 12px;
                color: var(--small-text);
            }
        }

        &__text {
            padding-right: 10px;

            white-space: pre-line;
            font-size: 18px;
        }
    }
}
</style>