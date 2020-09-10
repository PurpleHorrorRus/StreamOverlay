<template>
    <div id="left-submenu">
        <nuxt-link to="/settings/database/">
            <font-awesome-icon :icon="['fas', 'users']" />
        </nuxt-link>
        <nuxt-link to="/settings/database/config">
            <font-awesome-icon :icon="['fas', 'wrench']" />
        </nuxt-link>
    </div>
</template>

<style>
#left-submenu {
    grid-area: LeftSubmenu;
}

#left-submenu a {
    display: block;
    color: white;
    width: 38px;
    height: 35px;
    padding: 10px;
}

#left-submenu a:hover {
    background: #242424;
    cursor: pointer;
}

#left-submenu svg {
    display: block;
}
</style>