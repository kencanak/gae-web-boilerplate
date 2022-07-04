import * as path from 'path';
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import * as BrowserSyncPlugin from 'browser-sync-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { ASSETS, DIST_FOLDER, ENTRIES, SRC_FOLDER } from './webpack-plugins/utils';
import NunjucksBuild from './webpack-plugins/nunjucks-build';
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const compress = require('compression');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

module.exports = (env: any, argv: any) => {
  const isProd = argv.mode === 'production';
  return {
    mode: 'development',
    entry: ENTRIES,
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'esbuild-loader',
          options: {
            loader: 'ts',
            target: 'es2018'
          }
        },
        {
          test: /\.s?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  ident: 'postcss',
                  plugins: [
                    require('autoprefixer')()
                  ]
                }
              },
            },
            'sass-loader',
          ]
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                extract: true,
                spriteFilename: 'sprite.svg',
                outputPath: 'svg/',
                publicPath: '../svg/'
              }
            },
            'svgo-loader',
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'images',
                publicPath: '../images/',
                useRelativePaths: true
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    output: {
      path: path.join(__dirname, DIST_FOLDER),
      filename: `js/[name]${isProd ? '.[contenthash:5].min' : ''}.js`,
      clean: true,
    },
    devServer: {
      static: path.join(__dirname, DIST_FOLDER),
      hot: true,
    },
    plugins: [
      new ESLintPlugin({
        extensions: ['ts'],
      }),
      new NunjucksBuild(),
      new StylelintWebpackPlugin({
        files: '**/*.s?css',
      }),
      new MiniCssExtractPlugin({
        filename: `css/[name]${isProd ? '.[contenthash:5].min' : ''}.css`,
      }),
      new SpriteLoaderPlugin(),
      new CopyPlugin({
        patterns: ASSETS.map((asset) => {
          return {
            from: path.join(__dirname, SRC_FOLDER, asset),
            to: path.join(__dirname, DIST_FOLDER, asset),
            noErrorOnMissing: true,
          };
        }),
      }),
      // Browsersync for develpment server, only runs with --watch flag.
      new BrowserSyncPlugin({
        host: 'localhost',
        port: 3000,
        // proxy the Webpack Dev Server endpoint
        // through BrowserSync
        proxy: 'http://localhost:8080/',
        notify: false,
        middleware: [compress()],
        reloadDelay: 200,
        open: false,
      }),
    ],
    optimization: {
      concatenateModules: false,
      minimizer: [
        new OptimizeCSSAssetsPlugin({}),
      ],
    },
    performance: {
      maxEntrypointSize: 512000,
    },
  };
};
