<template>
    <div id="modal-stream-content" class="modal-content">
        <Title id="modal-stream-content-title" title="Трансляция" />
        <StreamContainer class="modal-body" />
    </div>
</template>

<script>
export default {
    components: {
        Title: () => import("~/components/Menu/Title"),
        StreamContainer: () => import("~/components/Menu/EditPage/Container")
    },

    layout: "modal"
};
</script>