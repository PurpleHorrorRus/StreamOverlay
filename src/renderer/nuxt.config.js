/* eslint-disable no-undef */
const isDev = process.env.NODE_ENV === "development";

module.exports = {
    env: require("../../env.json"),
    head: {
        title: "Stream Overlay",
        meta: [{ charset: "utf-8" }],
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
    telemetry: false,
    dev: isDev,
    loading: false,
    build: {
        publicPath: "./_nuxt/",

        extend(config, { isClient }) {
            if (isClient) {
                config.target = "electron-renderer";
                config.optimization.splitChunks.maxSize = 51200;
            }

            config.mode = process.env.NODE_ENV;
            config.devtool = isDev ? "inline-source-map" : false;
            config.performance = {
                hints: false,
                maxEntrypointSize: 512000,
                maxAssetSize: 512000
            };

            config.module.rules.find(rule => rule.test.test(".svg")).test = /\.(png|jpe?g|gif|webp)$/;
            config.module.rules.push({
                test: /\.svg$/,
                use: [
                    "babel-loader",
                    {
                        loader: "vue-svg-loader",
                        options: {
                            svgo: {
                                plugins: [{ removeDimensions: true }, { removeViewBox: false }]
                            }
                        }
                    }
                ]
            });

            config.module.rules.push({
                test: /\.mp3$/,
                loader: "file-loader"
            });
        },

        html: {
            minify: {
                collapseBooleanAttributes: true,
                decodeEntities: true,
                minifyCSS: true,
                minifyJS: true,
                processConditionalComments: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: true,
                trimCustomFragments: true,
                useShortDoctype: true,
                minifyURLs: true,
                removeComments: true,
                removeEmptyElements: true
            }
        },

        optimization: {
            minimize: true,
            splitChunks: {
                chunks: "async"
            }
        },

        splitChunks: {
            pages: false,
            vendor: false,
            commons: false,
            runtime: false,
            layouts: false
        },

        filenames: !isDev
            ? {
                app: () => "[contenthash:7].js",
                chunk: () => "[contenthash:7].js",
                css: () => "[contenthash:7].css"
            }
            : {},

        extractCSS: true
    },
    router: {
        prefetchLinks: false
    },
    vue: {
        config: {
            productionTip: false,
            devtools: false,
            silent: !isDev,
            performance: isDev
        }
    },
    css: [
        "~assets/css/global.scss",
        "vue-draggable-resizable/dist/VueDraggableResizable.css",
        "vue-range-component/dist/vue-range-slider.css"
    ],
    plugins: [
        "~/plugins/errors.js",
        { src: "~plugins/globalComponents.js", mode: "client" },
        { src: "~plugins/vue-range-component.js", mode: "client" },
        { src: "~plugins/vue-toggle-button.js", mode: "client" },
        { src: "~plugins/tooltip.js", mode: "client" }
    ],
    buildModules: ["@nuxtjs/style-resources"],
    modules: [
        [
            "nuxt-lazy-load",
            {
                images: true,
                videos: false,
                audios: false,
                iframes: false,
                native: false,
                polyfill: false,
                directiveOnly: true,

                defaultImage: "./lazy_avatar.png"
            }
        ]
    ],
    styleResources: {
        scss: ["~assets/css/colors.scss", "~assets/css/mixins.scss"]
    }
};