const marked = require('marked');

const ASSETS = 'assets';
const DIST = 'dist';
const SRC = 'src';
const DATA = 'data';

/**
 * Set options for marked package.
 * `gfm` needs to be `true` in order for `breaks: true` to work:
 * https://marked.js.org/using_advanced
 */
marked.setOptions({
  gfm: true,
  breaks: true,
});

const nunjucksEnv = function (environment) {
  environment.addFilter('json', JSON.stringify);
  environment.addFilter('markdown', marked);
};

module.exports = {
  SRC: {
    ROOT: SRC,
    DATA,
    DATA_FILES: `${DATA}/*.json`,
    HTML: `${SRC}/html/pages/**/*.{njk,nunjucks,html}`,
    ROBOTS: `${SRC}/misc/robots.njk`,
    SITEMAP: `${SRC}/misc/sitemap.njk`,
    TS: [`${SRC}/**/*.{ts,js}`],
    TS_ENTRIES: `${SRC}/html/pages/**/*.{ts,js}`,
    BASE_CSS: `${SRC}/styles`,
    CSS: [`${SRC}/**/*.{scss,css}`],
    IMG: `${SRC}/images`,
    SVG: `${SRC}/svgs`,
  },

  DIST: {
    ROOT: DIST,
    HTML: `${DIST}/**/*.html`,
    ASSETS: `${DIST}/${ASSETS}`,
    CSS: `${DIST}/${ASSETS}/css`,
    JS: `${DIST}/${ASSETS}/js`,
    DATA: `${DIST}/${ASSETS}/js/data`,
    SVG: `${SRC}/html/partials`,
    IMG: `${DIST}/${ASSETS}/images`,
    REV_MANIFEST: `${DIST}/${ASSETS}/rev-manifest.json`,
  },

  HTMLMIN_OPTIONS: {
    removeComments: true,
    collapseWhitespace: true,
  },

  BROWSERSYNC_OPTIONS: {
    server: DIST,
    notify: false,
  },

  NUNJUCKS_OPTIONS: {
    path: [`./src/html`, `./src`],
    manageEnv: nunjucksEnv,
  },

  FILES_TO_COPY: ['favicon.ico'],
};
