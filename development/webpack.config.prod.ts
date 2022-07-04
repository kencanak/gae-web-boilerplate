import * as path from 'path';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { merge } = require('webpack-merge');

import HTMLCleanUp from './webpack-plugins/html-cleanup';
const TerserPlugin = require('terser-webpack-plugin');

const baseConfig = require('./webpack.config');
import NunjucksNonHTMLBuild from './webpack-plugins/nunjucks-non-html-build';

const prodConfig = {
  devtool: false,
  plugins: [
    new WebpackManifestPlugin({
      publicPath: '',
    }),
    new NunjucksNonHTMLBuild(),
    new HTMLCleanUp({
      criticalCSS: {},
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        test: /\.js(\?.*)?$/i,
        parallel: true,
        terserOptions: {
          output: { comments: false },
          mangle: true,
          compress: {
            keep_fargs: false,
            pure_getters: true,
            hoist_funs: true,
            pure_funcs: [
              'classCallCheck',
              '_classCallCheck',
              '_possibleConstructorReturn',
              'Object.freeze',
              'invariant',
              'warning',
              'console.info',
              'console.debug',
              'console.warn',
              'console.log',
            ],
          },
        }
      }),
    ],
  },
};

module.exports = (env: any, argv: any) => {
  const config = merge(
    baseConfig(env, argv),
    prodConfig,
  );

  config.module = {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
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
    ],
  };

  return config;
};
