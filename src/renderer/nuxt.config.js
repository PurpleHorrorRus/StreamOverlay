/* eslint-disable no-undef */
const TerserPlugin = require("terser-webpack-plugin");
const TerserConfig = {
    cache: true,
    parallel: true
};

module.exports = {
    mode: "universal",
    head: {
        title: "Stream Overlay"
    },
    loading: false,
    build: {
        extend (config, { isClient }) {
            if (isClient) { 
                config.target = "electron-renderer"; 
            }
            config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== "UglifyJsPlugin");

            if (process.env.NODE_ENV === "production") {
                const obfuscator = require("webpack-obfuscator");
                config.plugins = [...config.plugins, new obfuscator({
                    compact: true,
                    stringArray: true,
                    rotateStringArray: true,
                    shuffleStringArray: true,
                    // disableConsoleOutput: true,
                    identifierNamesGenerator: "hexadecimal",
                    splitStrings: true,
                    splitStringsChunkLength: 10
                })];
            }

            config.module.rules.push(
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    test: /\.mp3$/,
                    loader: "file-loader"
                }
            );
        },
        optimization: {
            minimize: true,
            minimizer: [
                compiler => new TerserPlugin(TerserConfig).apply(compiler),
            ]
        }
    },
    dev: process.env.NODE_ENV === "development",
    css: [
        "@/assets/css/global.css",
        "vue-draggable-resizable/dist/VueDraggableResizable.css"
    ],
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
    plugins: [
        { src: "@plugins/vue-draggable-resizable", ssr: true },
        { src: "@plugins/autocomplete", ssr: true }
    ]
};
