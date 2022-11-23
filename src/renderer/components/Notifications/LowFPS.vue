<template>
    <div class="notification lowfps">
        <div class="notification-content">
            <span
                class="notification-text"
                v-text="$strings.NOTIFICATIONS.OBS.LOWFPS"
            />
        </div>
    </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.lowfps {
    border: 2px solid #ff0000;
}
</style>