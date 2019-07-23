const path = require("path");
const webpack = require("webpack");
const merge = require('webpack-merge')
const commonConfig = require('./webpack.base.config.js')
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')
const PurifyCSS = require('purifycss-webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const glob = require('glob-all')
const WorkboxPlugin = require('workbox-webpack-plugin') // 引入 PWA 插件


module.exports = merge(commonConfig, {
    mode: "production",
    output: {
        // 输出目录
        path: path.resolve(__dirname, "../build"),
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    },
    devtool: 'none',
    plugins: [
        // 清除无用 css---生产环境---csstree-shaking
        new PurifyCSS({
            paths: glob.sync([
                // 要做 CSS Tree Shaking 的路径文件
                path.resolve(__dirname, '..', 'src/*.html'),
                path.resolve(__dirname, '..', 'src/*.js'),
                path.resolve(__dirname, '..', 'src/**/*.jsx'),
            ])
        }),
        new BundleAnalyzerPlugin(),
        // PWA配置，生产环境才需要
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true
        }),
        // new AddAssetHtmlWebpackPlugin({
        //     outputPath:'static/js/',
        //     publicPath:'static/js/',
        //     filepath: path.resolve(__dirname, '../dll/jquery.dll.js') // 对应的 dll 文件路径
        // }),
        // new webpack.DllReferencePlugin({
        //     manifest: path.resolve(__dirname, '..', 'dll/jquery-manifest.json')
        // })
    ]
});
