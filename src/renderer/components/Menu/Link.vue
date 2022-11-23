<template>
    <div class="modal-link" @click="openLink">
        <span class="modal-link__text" v-text="text" />
    </div>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            required: true
        },

        link: {
            type: String,
            required: true
        }
    },

    methods: {
        openLink() {
            return this.$router.replace(this.link).catch(() => (false));
        }
    }
};
</script>

<style lang="scss">
.modal-link {
    display: flex;
    align-items: center;

    margin: 10px 0px;
    padding: 10px;

    border-radius: 6px;

    transition: background 0.2s ease-in-out;

    cursor: pointer;

    &:hover {
        background: var(--secondary);
    }
}
</style>