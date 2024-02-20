import * as path from 'path';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { ASSETS, DIST_FOLDER, ENTRIES, SRC_FOLDER } from './webpack-plugins/utils';
import NunjucksBuild from './webpack-plugins/nunjucks-build';
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

module.exports = (env: any, argv: any) => {
  const isProd = argv.mode === 'production';

  const dockerFlavoredConfig = process.env.DOCKER === "1" ? {
    watchOptions: {
      aggregateTimeout: 200,
      poll: 1000,
    }
  } : {};

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
            {
              loader: 'css-loader',
              options: {
                esModule: false
              },
            },
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
    target: 'web',
    ...dockerFlavoredConfig,
    output: {
      path: path.join(__dirname, DIST_FOLDER),
      filename: `js/[name]${isProd ? '.[contenthash:5].min' : ''}.js`,
      clean: true,
    },
    devServer: {
      host: '0.0.0.0',
      allowedHosts: 'all',
      static: {
        directory: path.join(__dirname, DIST_FOLDER),
      },
      hot: true,
      liveReload: true,
      watchFiles: [path.join(__dirname, SRC_FOLDER), path.join(__dirname, DIST_FOLDER)],
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
    ],
    optimization: {
      concatenateModules: false,
      minimizer: [
        new CssMinimizerPlugin({}),
      ],
    },
    performance: {
      maxEntrypointSize: 512000,
    },
  };
};
