const merge = require('webpack-merge').merge;
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const common = require('./webpack.default.js');

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [   
            new TerserPlugin({
                parallel: true, // 并行压缩
                extractComments: false,
                terserOptions:{
                    mangle: true,
                    compress:{
                        drop_console: true, 
                        // 删除 debugger 语句
                        drop_debugger: true,
                        pure_funcs: ['console.error'], // 删除 console.error
                    }           
                },
            }), 
            new OptimizeCSSAssetsPlugin()  
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
            ignoreOrder: false,
        }),
    ]
})