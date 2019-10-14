const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index",
  output: {
    path: path.join(__dirname, "/build"),
    filename: "bundle.js"
  },
  resolve: {
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
    })
  ]
};
