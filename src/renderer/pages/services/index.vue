<template>
    <div id="services-page" class="modal-content">
        <Title :title="$strings.MENU.SERVICES.TITLE" />
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