const path = require("path");

module.exports = {
  entry: "./src/App.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: [
          "style-loader", // Creates `style` nodes from JS strings
          "css-loader", // Translates CSS into CommonJS
          "sass-loader", // Compiles Sass to CSS
        ],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  "useBuiltIns": "usage",
                  "corejs": 3,
                  "targets": "defaults"
                }
              ],
              "@babel/preset-react"
            ]
          }
        }
      }
    ]
  },
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify")
    }
  }
};
