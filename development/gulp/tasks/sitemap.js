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

const sitemap = () => {
  return src(CONFIG.SRC.SITEMAP)
    .pipe(
      data({
        // this is nunjucks template data
        sitemap: getPageData('sitemap'),
        global: getPageData('global'),
      })
    )
    .pipe(nunjucks({
      ...CONFIG.NUNJUCKS_OPTIONS,
      ext: '.xml'
    }))
    .pipe(dest(CONFIG.DIST.ROOT))
    .pipe(reload());
}

module.exports = {
  sitemap,
};
