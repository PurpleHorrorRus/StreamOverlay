<template>
    <div id="widgets-page-content-container-edit">
        <Input
            :value="$parent.widget.name"
            :placeholder="$strings.MENU.WIDGETS.NAME"
            @input="$parent.widget.name = $event"
        />

        <Input
            :value="$parent.widget.src"
            :placeholder="$strings.MENU.WIDGETS.LINK"
            @input="$parent.widget.src = $event"
        />

        <SolidButton
            :label="$strings.MENU.WIDGETS.SAVE"
            :disabled="$parent.disabled"
            @click.native="$parent.saveWidget"
        />
    </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
#widgets-page-content-container-edit {
    grid-area: edit;

    .solid-button {
        margin: 10px;
    }
}
</style>