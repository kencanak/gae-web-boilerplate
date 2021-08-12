const CONFIG = require('../config');

const {
  html
} = require('./html');
const copy = require('./copy');
const scripts = require('./scripts');
const styles = require('./styles');
const svg = require('./svg');
const {robots} = require('./robots');
const {sitemap} = require('./sitemap');
const {
  watch,
  series
} = require('gulp');

function observe(done) {
  watch(CONFIG.FILES_TO_COPY, copy);
  watch(CONFIG.SRC.DATA_FILES, series(html, robots, sitemap));
  watch(`${CONFIG.SRC.ROOT}/**/*.{njk,html}`, html);
  watch(CONFIG.SRC.TS, scripts);
  watch(CONFIG.SRC.CSS, styles);
  watch(CONFIG.SRC.SVG, series(svg, html));
  watch(CONFIG.SRC.ROBOTS, robots);
  watch(CONFIG.SRC.SITEMAP, sitemap);
  done();
}

module.exports = observe;
