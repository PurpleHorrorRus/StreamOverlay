<template>
    <div id="modal-stream-content-edit">
        <Input
            :value="$parent.local.title"
            placeholder="Название трансляции"
            @input="$parent.local.title = $event"
            @keypress.enter.native="$parent.update"
        />

        <Input
            :value="$parent.local.game"
            :placeholder="'Название игры'"
            @input="$parent.local.game = $event"
            @keypress.enter.native="$parent.update"
        />

        <SolidButton
            label="Обновить"
            :disabled="$parent.disabled"
            :load="$parent.loading"
            @clicked="$parent.update"
        />
    </div>
</template>

<script>
export default {
    components: {
        Input: () => import("~/components/Settings/Input"),
        SolidButton: () => import("~/components/SolidButton")
    }
};
</script>

<style lang="scss">
#modal-stream-content-edit {
    grid-area: edit;

    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
}
</style>