const data = require('gulp-data');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const nunjucks = require('gulp-nunjucks-render');
const {
  src,
  dest,
  series
} = require('gulp');
const revReplace = require('gulp-rev-replace');
const gutil = require('gulp-util');
const {
  reload
} = require('./browsersync');

const CONFIG = require('../config');
const {
  getPageData,
} = require('../utils');

function rewrite(done) {
  const isProd = gutil.env['prod'];

  if (!isProd) {
    done();
    return;
  }
  const manifest = src(CONFIG.DIST.REV_MANIFEST);

  return src('dist/**/*.html').pipe(revReplace({
    manifest
  })).pipe(dest(CONFIG.DIST.ROOT));
}

const html = series(templating, moveHomePageFolderToRoot, rewrite, clean);

function templating() {
  return src(CONFIG.SRC.HTML)
    .pipe(
      data({
        // this is nunjucks template data
        global: getPageData('global'),
        home: getPageData('home'),
      })
    )
    .pipe(nunjucks(CONFIG.NUNJUCKS_OPTIONS))
    .pipe(htmlmin(CONFIG.HTMLMIN_OPTIONS))
    .pipe(dest(CONFIG.DIST.ROOT));
}

function clean() {
  return del([`${CONFIG.DIST.ROOT}/home`, CONFIG.DIST.REV_MANIFEST]);
}

function moveHomePageFolderToRoot() {
  return src(`${CONFIG.DIST.ROOT}/home/index.html`).pipe(dest(CONFIG.DIST.ROOT)).pipe(reload());
}

module.exports = {
  html,
};
