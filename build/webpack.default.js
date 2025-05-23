const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

const NODE_ENV = process.env.NODE_ENV

const devMode = NODE_ENV === "development";

// 根据环境来读取配置文件（本地环境和对应的环境）
const dotenvFiles = ['.env.local', `.env.${NODE_ENV}.local`, `.env.${NODE_ENV}`, `.env`].filter(
    Boolean
)

const dotEnvPlugins = [];
dotenvFiles.forEach((file) => {
    // 识别文件是否存在
    if (!fs.existsSync(path.resolve(__dirname, `../${file}`))) {
        return
    }
    
    dotEnvPlugins.push(new Dotenv({
        path: path.resolve(__dirname, `../${file}`),
        systemvars: true, // 加载系统环境变量
        silent: true, // 忽略无效的 .env 文件
    }))
})

module.exports = {
    entry: path.resolve(__dirname, '..', 'src/app.js'),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../dist'),
        clean: true,
        publicPath: '/'
    },
    cache: {
        type: 'filesystem',
        allowCollectingMemory: true,
    },
    resolve:{
        extensions:['.js','.jsx','.json'],//这几个后缀名的文件后缀可以省略不写
        alias:{
            '@':path.join(__dirname, '../src'), //这样 @就表示根目录src这个路径
            '@modules': path.join(__dirname, '../node_modules'),
            '@service': path.join(__dirname, '../src/service'),
            '@pages': path.join(__dirname, '../src/pages'),
            '@utils': path.join(__dirname, '../src/utils'),
            '@components': path.join(__dirname, '../src/components'),
            '@constant': path.join(__dirname, '../src/constant'),
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                exclude: /\.module\.css$/, // 排除模块化css文件
                use: [
                    devMode ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-preset-env",
                                ]
                            }
                        }
                    },
                ],
            },
            {
                test: /\.module\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            sourceMap: true,  
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-preset-env",
                                ]
                            }
                        }
                    },
                ],
            },
            {
                test: /\.less$/i,
                exclude: /\.module\.less$/,
                use: [
                    devMode ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-preset-env",
                                ]
                            }
                        }
                    }, 
                    {
                        loader: "less-loader", 
                        options: {
                            lessOptions:{
                                javascriptEnabled:true,
                            }
                        }
                    }
                ],
            },
            {
                test: /\.module\.less$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-preset-env",
                                ]
                            }
                        }
                    }, 
                    {
                        loader: "less-loader", 
                        options: {
                            lessOptions:{
                                javascriptEnabled:true,
                            }
                        }
                    }
                ],
            },
            {
                test: /\.js(x)?$/i,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            [
                                "@babel/preset-env", 
                                {
                                    "targets": "> 0.25%, not dead" 
                                }   
                            ], 
                            [
                                "@babel/preset-react",
                                {
                                    "runtime": "automatic"
                                }
                            ]
                        ],
                        "plugins": [
                            "@babel/plugin-transform-runtime",
                        ],
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(csv|tsv)$/i,
                use: ['csv-loader'],
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css', // 提取的 CSS 文件名
            chunkFilename: '[id].css', // 按需加载的 CSS 文件名
        }),
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            title: process.env.PROJECT_NAME,
            inject: 'head',
            favicon: path.resolve(__dirname, '..', 'public/favicon.ico'),
            template: path.resolve(__dirname, '..', 'public/index.ejs'),
            minify: { // 压缩html
                collapseWhitespace: true,
                removeComments: true
            }
        }),
        ...dotEnvPlugins,
    ]
}