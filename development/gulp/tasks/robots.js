const data = require('gulp-data');
const nunjucks = require('gulp-nunjucks-render');
const {
  src,
  dest,
} = require('gulp');
const {
  reload
} = require('./browsersync');

const CONFIG = require('../config');
const {
  getPageData,
} = require('../utils');

const robots = () => {
  return src(CONFIG.SRC.ROBOTS)
    .pipe(
      data({
        // this is nunjucks template data
        robots: getPageData('robots'),
        global: getPageData('global'),
      })
    )
    .pipe(nunjucks({
      ...CONFIG.NUNJUCKS_OPTIONS,
      ext: '.txt'
    }))
    .pipe(dest(CONFIG.DIST.ROOT))
    .pipe(reload());
}

module.exports = {
  robots,
};
