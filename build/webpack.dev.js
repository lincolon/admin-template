const merge = require('webpack-merge').merge;
const webpack = require('webpack');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const common = require('./webpack.default.js');

const devPort = process.env.PORT || '8000';

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        port: devPort,
        host: '0.0.0.0',
        hot: true,
        liveReload: true,
        historyApiFallback: true,
        open: true, //服务启动后打开浏览器,
        client: {
            reconnect: true,
            progress: true,
            overlay: {
                errors: true,
                warnings: false,
            },
        },
        watchFiles: ['src/**/*', 'public/**/*', 'package.json', 'project.config.json'],
    },
    plugins: [
        new FriendlyErrorsWebpackPlugin({
            compilationSuccessInfo: {
                messages: [
                    `Your application is running here: http://127.0.0.1:${devPort}`,
                    `Network: http://${require('ip').address()}:${devPort}`,
                ],
                
            },
            clearConsole: true,
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
});