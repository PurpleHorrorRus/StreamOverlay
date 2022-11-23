<template>
    <div class="viewers-list-category">
        <span 
            class="viewers-list-category-name nowrap" 
            v-text="categoryName" 
        />

        <span
            v-for="user of users"
            :key="user"
            class="viewers-list-category-user"
            v-text="user"
        />
    </div>
</template>

<script>
export default {
    props: {
        name: {
            type: String,
            required: true
        },

        users: {
            type: Array,
            required: true
        }
    },

    computed: {
        categoryName() {
            return `${this.name} (${this.users.length})`;
        }
    }
};
</script>

<style lang="scss">
.viewers-list-category {
    display: flex;
    flex-direction: column;

    margin-bottom: 10px;

    &:first {
        margin-bottom: 0px;
    }

    &-name {
        color: #4366c4;
        font-size: 16px;
        font-weight: 600;
    }

    &-user {
        color: #ffffff;
        font-size: 14px;
    }
}
</style>