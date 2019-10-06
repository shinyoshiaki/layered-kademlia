const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

const dist = __dirname + "/build";

module.exports = {
  entry: "./src/index",
  output: {
    path: dist,
    filename: "bundle.js"
  },
  resolve: {
    alias: {
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom")
    },
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        use: [
          {
            loader: "worker-loader",
            options: { inline: true, name: "[name].js" }
          },
          "ts-loader"
        ]
      },
      {
        test: /\.ts(x)?$/,
        use: { loader: "ts-loader" }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      favicon: "./public/favicon.ico"
    }),
    new WorkboxWebpackPlugin.GenerateSW({
      globDirectory: dist,
      globPatterns: ["*.{html,js,css}", "images/*.{png,gif,webp,svg,jpg,jpeg}"],
      swDest: dist + "/sw.js"
    })
  ],
  devServer: {
    disableHostCheck: true
  }
};
