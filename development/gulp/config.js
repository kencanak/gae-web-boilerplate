const marked = require('marked');
const fs = require('fs');
const path = require('path');

const ASSETS = 'assets';
const DIST = 'dist';
const SRC = 'src';
const DATA = 'data';
const PAGES_PATH = './src/html/pages';

const jsSrc = [
  'src/**/*.js',
  '!src/static/**/*.js',
];

const tsSrc = [
  'src/**/*.ts',
];

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

function getPageFiles(regex) {
	// TODO: refactor the way we look for page's js files, as this will break
	//			 if there is sub folder in each page folder

	const files = [];
	fs.readdirSync(PAGES_PATH)
		.forEach((file) => {
			// obtain page absolute path, this is with the assumption
			// that the code structure will be pages > page_name > file
			// check if it's a directory
			const pagePath = path.join(PAGES_PATH, file);
			const pageStat = fs.statSync(pagePath);

			if (pageStat.isDirectory()) {
				const pageFiles = fs.readdirSync(pagePath);

				pageFiles.forEach((fileName) => {
					if (fileName.match(regex)) {
						const temp = `${PAGES_PATH}/${file}/${fileName}`;

						files.push({
							// file would be the page folder name
							name: file,
							entry: temp,
						});
					}
				});
			}
		});

	return files;
}

function getPageJSEntries() {
	const pageJS = getPageFiles(/(.*?)\.(js|ts)$/);

	return pageJS.map((item) => {
		return {
			// file would be the page folder name
			name: item.name,
			entry: item.entry.replace('.ts', ''),
			dist: `./src/static/js/${item.name}.min.js`,
      jsLintSrc: jsSrc,
      tsLintSrc: tsSrc,
      src: jsSrc.concat(tsSrc),
		}
  });
}

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

  JS_TS_SRC: [
    {
      entry:  './src/scripts/base',
      dist:   './src/static/js/base.min.js',
      jsLintSrc:    jsSrc,
      tsLintSrc:    tsSrc,
      src:    jsSrc.concat(tsSrc),
    },
    ...getPageJSEntries(),
  ],

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
