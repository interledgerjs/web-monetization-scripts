'use strict'
const webpack = require('webpack')
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  mode: 'production',

  entry: {
    'donate': ['@babel/polyfill', './src/donate.js'],
    'counter': ['./src/counter.js'],
    'if-monetized': ['./src/if-monetized.js'],
    'if-not-monetized': ['./src/if-not-monetized.js']
  },

  output: {
    filename: 'dist/[name].js',
    path: __dirname,
    libraryTarget: 'umd'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  },

  /*plugins: [
    new BundleAnalyzerPlugin()
  ],*/

  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}
