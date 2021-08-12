/** @fileoverview  webpack config file for web-standard scaffold.
 */
const path = require('path');
const glob = require('glob');
const CONFIG = require('./config');
const gutil = require('gulp-util');
const isProd = gutil.env['prod'];

// we should compile base and detect component by default
let entries = {
  base: './src/scripts/base',
};

function getEntries() {
  const entries = {};

  glob.sync(CONFIG.SRC.TS_ENTRIES).forEach((item) => {
    const name = path.basename(item).replace(path.extname(item), '');
    entries[name] = `./${item}`;
  });

  return entries;
}

entries = {
  ...entries,
  ...getEntries()
};

module.exports = {
  devtool: isProd ? 'source-map' : 'inline-source-map',
  mode: isProd ? 'production' : 'development',
  entry: entries,
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    path: path.resolve(__dirname, CONFIG.DIST.JS),
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        enforce: 'pre',
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env', {
                  'targets': {
                    'node': 'current'
                  }
                }
              ],
              '@babel/typescript'
            ],
            plugins: [
              '@babel/proposal-class-properties',
              '@babel/proposal-object-rest-spread',
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-nullish-coalescing-operator',
              '@babel/plugin-proposal-numeric-separator',
            ]
          }
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
};
