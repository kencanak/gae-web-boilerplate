const CONFIG = require('../config');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const rev = require('gulp-rev');
const rename = require('gulp-rename');
const {
  stream
} = require('./browsersync');
const {
  dest,
  src
} = require('gulp');
const gutil = require('gulp-util');

const postcssProcessors = [
  autoprefixer,
  cssnano,
];

function styles() {
  const isProd = gutil.env['prod'];

  return src(CONFIG.SRC.CSS)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: [
          'node_modules',
        ],
        outputStyle: 'compressed',
      }).on('error', sass.logError)
    )
    .pipe(postcss(postcssProcessors))
    // If the sourcemap flag is passed, write sourcemap to output.
    .pipe(
      gutil.env['css-sourcemaps'] ? sourcemaps.write() : gutil.noop()
    )
    .pipe(rename({dirname: '/css'}))
    .pipe(isProd ? rev() : gutil.noop())
    .pipe(dest(CONFIG.DIST.ASSETS))
    .pipe(
      isProd ?
      rev.manifest(CONFIG.DIST.REV_MANIFEST, {
        base: CONFIG.DIST.ASSETS,
        merge: true,
      }) :
      gutil.noop()
    )
    .pipe(dest(CONFIG.DIST.ASSETS))
    .pipe(stream());
}

module.exports = styles;
