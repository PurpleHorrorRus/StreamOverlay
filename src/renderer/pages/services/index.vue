<template>
    <div id="services-page">
        <Title title="Настройки сервисов" />
        <ServiceSelector />
    </div>
</template>

<script>
export default {
    components: {
        Title: () => import("~/components/Menu/Title"),
        ServiceSelector: () => import("~/components/Settings/Services/ServiceSelector")
    },

    layout: "modal"
};
</script>