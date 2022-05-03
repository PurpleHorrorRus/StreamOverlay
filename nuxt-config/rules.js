/* eslint-disable no-undef */
module.exports = [
    {
        test: /\.svg$/,
        use: ["babel-loader", {
            loader: "vue-svg-loader",
            options: {
                svgo: {
                    plugins: [
                        { removeDimensions: true }, 
                        { removeViewBox: false }
                    ]
                }
            }
        }]
    },

    {
        test: /\.mp3$/,
        loader: "file-loader"
    }
];