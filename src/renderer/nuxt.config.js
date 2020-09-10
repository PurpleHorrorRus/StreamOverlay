/* eslint-disable no-undef */
const TerserPlugin = require("terser-webpack-plugin");
const TerserConfig = {
    cache: true,
    parallel: true
};

const cssnano = require("cssnano");

module.exports = {
    mode: "universal",
    head: {
        title: "Stream Overlay",
        meta: [
            { charset: "utf-8" }
        ]
    },
    loading: false,
    build: {
        extend (config, { isClient }) {
            if (isClient) { 
                config.target = "electron-renderer"; 
            }

            config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== "UglifyJsPlugin");

            config.module.rules.push(
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                }
            );
        },
        optimization: {
            minimize: true,
            minimizer: [
                compiler => new TerserPlugin(TerserConfig).apply(compiler),
            ]
        },
        postcss: {
            plugins: [
                cssnano({ preset: "default" })
            ]
        }
    },
    dev: process.env.NODE_ENV === "development",
    css: [
        "~assets/css/global.scss",
        "vue-draggable-resizable/dist/VueDraggableResizable.css"
    ],
    plugins: [
        { src: "@plugins/vue-draggable-resizable", ssr: true },
        { src: "@plugins/autocomplete", ssr: true }
    ],
    buildModules: ["@nuxtjs/style-resources"],
    modules: [
        [
            "nuxt-fontawesome", {
                imports: [
                    {
                        set: "@fortawesome/free-solid-svg-icons",
                        icons: ["fas"]
                    },
                    {
                        set: "@fortawesome/free-brands-svg-icons",
                        icons: ["fab"]
                    },
                    {
                        set: "@fortawesome/free-regular-svg-icons",
                        icons: ["far"]
                    }
                ]
            }
        ]
    ],
    styleResources: {
        scss: [
            "~assets/css/colors.scss"
        ]
    }
};
