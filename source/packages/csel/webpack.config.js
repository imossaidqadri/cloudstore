/* eslint-env node */
const path = require("path");
const webpack = require("webpack");
const { ConcatSource } = require("webpack-sources");
const LicenseWebpackPlugin = require("license-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: {
    mozjexl: "./lib/Jexl.js"
  },
  output: {
    path: path.resolve(__dirname, "vendor/"),
    filename: "[name].jsm",
    library: "[name]",
    libraryTarget: "this"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    /**
     * Plugin that appends "this.EXPORTED_SYMBOLS = ["libname"]" to assets
     * output by webpack. This allows built assets to be imported using
     * Cu.import.
     */
    function ExportedSymbols() {
      this.plugin("emit", function(compilation, callback) {
        for (const libraryName in compilation.entrypoints) {
          const assetName = `${libraryName}.jsm`; // Matches output.filename
          compilation.assets[assetName] = new ConcatSource(
            "/* eslint-disable */", // Disable linting
            compilation.assets[assetName],
            `this.EXPORTED_SYMBOLS = ["${libraryName}"];` // Matches output.library
          );
        }
        callback();
      });
    },
    new LicenseWebpackPlugin({
      pattern: /^(MIT|ISC|MPL.*|Apache.*|BSD.*)$/,
      filename: `LICENSE_THIRDPARTY`
    })
  ]
};
