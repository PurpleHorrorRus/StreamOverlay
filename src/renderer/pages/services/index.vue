<template>
    <div id="services-page" class="modal-content">
        <Title title="Настройки сервисов" />
        <ServiceSelector class="modal-body" />
    </div>
</template>

<script>
export default {
    components: {
        ServiceSelector: () => import("~/components/Settings/Services/ServiceSelector")
    },

    layout: "modal"
};
</script>