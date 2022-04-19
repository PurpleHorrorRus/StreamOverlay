<template>
    <div id="modal-lock">
        <span id="modal-lock-tip" v-text="'Alt+A'" />
        <LockIcon v-if="locked" id="locked" class="icon" />
        <UnlockIcon v-else id="unlocked" class="icon" />
    </div>
</template>

<script>
export default {
    components: {
        LockIcon: () => import("~/assets/icons/lock.svg"),
        UnlockIcon: () => import("~/assets/icons/unlock.svg")
    },

    props: {
        locked: {
            type: Boolean,
            required: true
        }
    }
};
</script>

<style lang="scss">
#modal-lock {
    position: absolute;
    top: 10px;
    right: 10px;

    display: flex;
    align-items: center;
    column-gap: 10px;

    &-tip {
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.7);

        font-size: 13px;
        font-weight: 600;
    }

    #locked {
        stroke: #ff0000;
    }

    #unlocked {
        stroke: #90ee90;
    }
}
</style>