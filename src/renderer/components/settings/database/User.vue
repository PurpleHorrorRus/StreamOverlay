<template>
    <div class="database-user">
        <span class="database-user-id" v-text="user.id" /> 
        <span class="database-user-name" v-text="user.name" />
        <span class="database-user-level" v-text="user.level" />
        <span class="database-user-cthulhucoins" v-text="coins" />
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters({
            strings: "strings/getStrings"
        }),
        coins () { 
            return `${this.user.Cthulhucoins}/${this.user.Level * 50}`; 
        },
    }
};
</script>

<style>
.database-user {
    display: inline-block;
    width: 100%;
    height: 40px;
    padding: 15px;
    padding-left: 0px;
    font-size: 9pt;
}

.database-user span {
    display: inline-block;
    margin-left: 15px;
}
</style>