/* eslint-disable no-undef */
const cssnano = require("cssnano");

module.exports = {
    head: {
        title: "Stream Overlay",
        meta: [
            { charset: "utf-8" }
        ],
        link: [
            {
                rel: "preconnect",
                href: "https://fonts.gstatic.com"
            },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap"
            },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&display=swap"
            }
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

            config.module.rules.push({
                test: /\.(ogg|mp3|wav|mpe?g)$/i,
                loader: "file-loader",
                options: {
                    name: "[path][name].[ext]"
                }
            });
        },
        cache: true,
        parallel: true,
        optimization: {
            minimize: true,
            minimizer: []
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
        "vue-draggable-resizable/dist/VueDraggableResizable.css",
        "vue-range-component/dist/vue-range-slider.css"
    ],
    plugins: [
        { src: "~plugins/vue-draggable-resizable", ssr: true },
        { src: "~plugins/autocomplete", ssr: true },
        { src: "~plugins/vue-range-component.js", mode: "client" },
        { src: "~plugins/vue-toggle-button.js", mode: "client" }
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
