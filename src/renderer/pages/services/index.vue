<template>
    <div id="services-page">
        <Title title="Настройки сервисов" />

        <div id="services-page-list">
            <Link
                v-for="service of services"
                :key="service.to"
                :item="service"
            />
        </div>
    </div>
</template>

<script>
export default {
    components: {
        Title: () => import("~/components/Menu/Title"),
        Link: () => import("~/components/Menu/Header/Link")
    },

    layout: "modal",

    data: () => ({
        services: [
            {
                title: "Настройки Twitch",
                to: "/services/twitch"
            },
            {
                title: "Настройки Trovo",
                to: "/services/trovo"
            }
        ]
    })
};
</script>

<style lang="scss">
#services-page {
    &-list {
        margin-top: 10px;
    }
}
</style>