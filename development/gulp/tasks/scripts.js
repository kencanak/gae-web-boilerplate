const CONFIG = require('../config');
const {
  stream
} = require('./browsersync');
const {
  dest,
  src,
  series
} = require('gulp');
const ts = require('gulp-typescript');
const size = require('gulp-size2');
const sourcemaps = require('gulp-sourcemaps');
const glob = require('glob');
const path = require('path');
const rev = require('gulp-rev');
const merge = require('merge-stream');
const fs = require('fs-extra');
const config = require('../config');
const gutil = require('gulp-util');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const del = require('del');

const getPagesEntry = () => {
  let entries = {};

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

function compileSingleEntry(options) {
  options.deps = options.deps || [];

  const baseSrc = options.deps.concat(options.src);

  // A TS project with tsconfig for compiling ts -> js.
  const tsProject = ts.createProject(`./tsconfig.json`);

  // Create the destination directory if it doesn't exist.
  fs.mkdirpSync(path.dirname(options.dist));

  return src(baseSrc, {base: './'})
    .pipe(sourcemaps.init())
    .pipe(tsProject().on('error', (err) => {
      options.error = true;
      console.error('ts', options.dist, err.message);
    }))
    .on('end', () => {
      if (options.error) { return; };
      console.info('ts',
          `Compiled ${options.entry.toString()} module`);;
    })
    .pipe(
      gutil.env['js-sourcemaps'] ? sourcemaps.write() : gutil.noop()
    )
    .pipe(rename({dirname: '/js'}))
    .pipe(size({
      gzip: true,
      showFiles: true,
      log: (title, what, size) => {
        const sizeKb = Math.round(size / 1000 * 100) / 100;
        console.log('size', `gZipped size of ${what} is ${sizeKb} Kb`);
      }
    }))
    .pipe(isProd ? terser({
      keep_fnames: true,
      mangle: false,
      compress: {
        drop_console: true,
      }
    }) : gutil.noop())
    .pipe(dest(CONFIG.DIST.ASSETS));

}

function compile() {
  const streams = entriesData.map((entry) => {
    return compileSingleEntry(entry);
  });

  return merge(streams)
    .on('end', () => {
      const total = entriesData.length;

      // Count any errors.
      const errors = entriesData.filter((config) => {
        return !!config.error;
      });

      // Count successes.
      const successes = total - errors;

      const data = {
        success: successes.toString(),
        count: total.toString(),
        errors: errors.toString()
      };

      const slog = `Compiled ${data.count} ts files with ${data.errors} errors`;
      const elog = `${data.success} out of ${data.count} ts files compiled without errors`;

      if (errors === 0) {
        console.log('ts', slog);
      } else {
        console.log('ts', elog) && gutil.beep();
      }

      entriesData.forEach((js) => {
        js.error = false;
      });
    })
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
