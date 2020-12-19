<template>
    <div class="solid-button" :class="{ disabled }" @click.stop="click">
        <span 
            v-if="!load"
            class="solid-button-label" 
            v-text="label" 
        />
        <font-awesome-icon v-else class="fa-spin" :icon="['fas', 'circle-notch']" />
    </div>
</template>

<script>
export default {
    props: {
        load: {
            type: Boolean,
            required: false,
            default: false
        },
        label: {
            type: String,
            required: true
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    methods: {
        click () {
            if (!this.load && !this.disabled) {
                this.$emit("clicked");
            }
        }
    }
};
</script>

<style lang="scss">
.solid-button {
    display: block;
    min-width: 60px;
    width: max-content;
    max-width: 400px;
    height: 30px;

    margin-top: 10px;
    padding: 8px;

    background: $secondary;
    border-radius: 5px;

    font-size: 9pt;
    text-align: center;

    transition: all .5s ease;

    &.disabled {
        cursor: not-allowed;
        background: $disabled;

        * {
            &:hover {
                cursor: not-allowed;
            }
        }
    }

    &:not(.disabled) {
        span {
            cursor: pointer;
        }
        
        &:hover {
            cursor: pointer;
            background: $secondary-hover;
        }
    }

    &-label {
        color: $text;
    }
}
</style>