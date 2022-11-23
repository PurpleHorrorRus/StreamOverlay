const root = "~plugins";
const plugins = [
    "globalComponents",
    "directives",
    "tooltip",
    "i18n"
];

// eslint-disable-next-line no-undef
module.exports = () => {
    return plugins.map(plugin => {
        return {
            src: `${root}/${plugin}.js`,
            mode: "client"
        };
    });
};