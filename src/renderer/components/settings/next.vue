<template>
    <div class="next-button">
        <span class="next-button-icon" v-if="!loading">Далее</span>
        <font-awesome-icon id="viewers_count" :icon="['fas', 'circle-notch']" class="fa-spin" v-else/>
    </div>
</template>

<script>
export default {
    props: {
        loading: {
            type: Boolean,
            required: false,
            default: false
        }
    }
}
</script>

<style>
.next-button {
    border: 1px solid white;
    border-radius: 5px;
    padding: 10px;
    float: right;
    position: relative;
    top: 10px;
    right: 0%;
}

.next-button:hover {
    cursor: pointer;
    border: 1px solid rgb(117, 117, 252);
}
</style>