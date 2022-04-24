<template>
    <div id="widgets-page-content" class="modal-content">
        <Title title="Редактирование виджетов" />
        <WidgetPageContainer class="modal-body" />
    </div>
</template>

<script>

export default {
    components: {
        WidgetPageContainer: () => import("~/components/Menu/WidgetsPage/Container")
    },

    layout: "modal"
};
</script>