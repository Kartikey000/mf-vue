const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
    mode: 'production',
    entry: './src/main.ts', // Entry point is now TypeScript
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        filename: '[name].[contenthash].js',
        publicPath: 'auto',
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource', // Webpack 5's built-in asset module
                generator: {
                    filename: 'assets/images/[name].[hash][ext]', // Output path for images
                },
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.ts$/, // Rule for TypeScript files
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/], // Process .vue files as TypeScript
                },
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [
                        ['@babel/preset-env', {
                            // Explicitly target environments that support ES Modules and async/await
                            targets: {
                                esmodules: true
                            }
                        }]
                    ]
                }
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                ],
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
            inject: true,
            templateParameters: {
                BASE_URL: '/',
            },
        }),
        new ModuleFederationPlugin({
            name: 'userAppVue3',
            filename: 'remoteEntry.js',
            exposes: {
                './UserList': './src/pages/UserList.vue',
                './vue': 'vue',
            }
        }),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'], // Add .ts to extensions
    }
};
