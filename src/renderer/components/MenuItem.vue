<template>
    <div class="modal-navigation-link" @click="$emit('click')">
        <font-awesome-icon v-if="!load" :icon="icon" />
        <font-awesome-icon v-else class="fa-spin" :icon="['fas', 'circle-notch']" />
        <span class="modal-navigation-text" v-text="text" />
    </div>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            required: true,
            default: "Не назначено"
        },
        icon: {
            type: Array,
            required: true
        },
        load: {
            type: Boolean,
            required: false,
            default: false
        }
    }
};
</script>

<style lang="scss">
.modal-navigation {
    &-link {
        display: flex;
        justify-content: start;
        align-items: center;
        width: 100%;
        height: 40px;

        padding: 10px;

        &:hover {
            cursor: pointer;
            background: $secondary;
        }
    }

    &-text {
        margin-left: 10px;
    }
}
</style>