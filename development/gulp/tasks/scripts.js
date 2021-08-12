const CONFIG = require('../config');
const {
  stream
} = require('./browsersync');
const {
  dest,
  src,
  series
} = require('gulp');
const webpack = require('webpack-stream');
const glob = require('glob');
const path = require('path');
const rev = require('gulp-rev');
const config = require('../config');
const gutil = require('gulp-util');
const del = require('del');
const webpackConfig = require('../webpack.config.ts');

const getPagesEntry = () => {
  const entries = {};

  glob.sync(CONFIG.SRC.TS_ENTRIES).forEach((item) => {
    const name = path.basename(item).replace(path.extname(item), '');
    entries[name] = `./${item}`;
  });

  return entries;
};

const isProd = gutil.env['prod'];

const entries = getPagesEntry();
const entriesData = Object.keys(entries).map((entry) => {
  return {
    name: entry,
    entry: entries[entry].replace('.ts', ''),
    dist: `${config.DIST.JS}/${entry}.js`,
    src: config.SRC.TS,
  };
});

function compile() {
  let srcs = [];

  CONFIG.JS_TS_SRC.forEach((srcObj) => {
    srcs = [...srcs, srcObj.src];
  });

  return src(CONFIG.SRC.TS)
    .pipe(webpack(webpackConfig))
    .pipe(dest(CONFIG.DIST.JS))
    .pipe(isProd ? gutil.noop() : stream());
}

function revScripts(done) {
  if (!isProd) {
    done();
    return;
  }

  return src(`${CONFIG.DIST.JS}/**/*.js`)
    .pipe(rev())
    .pipe(dest(CONFIG.DIST.JS))
    .pipe(
      isProd ?
      rev.manifest(CONFIG.DIST.REV_MANIFEST, {
        base: CONFIG.DIST.ASSETS,
        merge: true,
      }) :
      gutil.noop()
    )
    .pipe(dest(CONFIG.DIST.ASSETS));
}

function cleanUp(done) {
  if (!isProd) {
    done();
    return;
  }

  const toClean = entriesData.map((entry) => entry.dist);
  toClean.push(`${config.DIST.JS}/base.js`);

  return del(toClean);
}

function scripts(done) {
  return series(compile, revScripts, cleanUp)(done);
}

module.exports = scripts;
