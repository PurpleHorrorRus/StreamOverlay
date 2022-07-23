/* eslint-disable no-undef */
const vueConfig = require("../../nuxt-config/vue");
const headConfig = require("../../nuxt-config/head");
const optimizationConfig = require("../../nuxt-config/optimization");
const webpackRules = require("../../nuxt-config/rules");
const webpackPlugins = require("../../nuxt-config/plugins");
const webpackModules = require("../../nuxt-config/modules");
const routerConfig = require("../../nuxt-config/router.json");
const cssRules = require("../../nuxt-config/css.json");

const isDev = process.env.NODE_ENV === "development";

module.exports = {
    target: "server",
    ssr: false,

    telemetry: false,
    dev: isDev,
    loading: false,
    
    env: require("../../env.json"),
    head: headConfig,
    router: routerConfig,
    vue: vueConfig,
    plugins: webpackPlugins(),
    css: cssRules,
    buildModules: ["@nuxtjs/style-resources"],
    modules: webpackModules,

    styleResources: {
        scss: ["~assets/css/mixins.scss"]
    },
    
    build: {
        publicPath: "./_nuxt/",

        babel: {
            presets() {
                return [
                    ["@nuxt/babel-preset-app", {
                        corejs: { version: 3 }
                    }]
                ];
            }
        },

        extend(config, { isClient }) {
            config.resolve.alias.vue = "vue/dist/vue.min";

            if (isClient) {
                config.target = "electron-renderer";
                config.devtool = "source-map";
            }
            
            config.mode = process.env.NODE_ENV;
            config.performance = optimizationConfig.performance;

            config.module.rules.find(rule => rule.test.test(".svg")).test = /\.(gif|webp)$/;
            config.module.rules = config.module.rules.concat(webpackRules);
        },

        html: isDev ? optimizationConfig.html : {},
        optimization: !isDev ? optimizationConfig.optimization : {},
        splitChunks: isDev ? optimizationConfig.splitChunks : {},
        filenames: !isDev ? optimizationConfig.filenames : {},
        extractCSS: false
    }
};