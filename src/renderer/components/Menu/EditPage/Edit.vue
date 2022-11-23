<template>
    <div id="modal-stream-content-container-edit">
        <Input
            :value="$parent.local.title"
            :placeholder="$strings.MENU.STREAM.STREAM_TITLE"
            @input="$parent.local.title = $event"
            @keypress.enter.native="$parent.update"
        />

        <Input
            :value="$parent.local.game"
            :placeholder="$strings.MENU.STREAM.STREAM_CATEGORY"
            @input="$parent.local.game = $event"
            @keypress.enter.native="$parent.update"
        />

        <SolidButton
            :label="$strings.MENU.STREAM.UPDATE"
            :disabled="$parent.disabled"
            :load="$parent.loading"
            @click.native="$parent.update"
        />
    </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
#modal-stream-content-container-edit {
    grid-area: edit;

    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
}
</style>