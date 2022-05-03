<template>
    <div id="widgets-page-content-container-list">
        <div id="widgets-page-content-container-list-items">
            <WidgetListItem 
                v-for="(widget, index) of $parent.widgets"
                :key="widget.id"
                :widget="widget" 
                @click.native="$parent.select(index)"
            />
        </div>

        <div id="widgets-page-content-container-list-actions">
            <SolidButton 
                :label="'Добавить'" 
                @click.native="$parent.add" 
            />

            <SolidButton 
                :label="'Удалить'" 
                :disabled="$parent.disabled" 
                @click.native="$parent.delete" 
            />
        </div>
    </div>
</template>

<script>
export default {
    components: {
        WidgetListItem: () => import("~/components/Menu/WidgetsPage/List/Item")
    }
};
</script>

<style lang="scss">
#widgets-page-content-container-list {
    grid-area: navigation;

    &-items {
        height: 215px;

        overflow-x: hidden;
        overflow-y: auto;
    }

    &-actions {
        display: flex;
        justify-content: space-evenly;
        justify-self: center;
    }
}
</style>