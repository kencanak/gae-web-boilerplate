const CONFIG = require('../config');
const browserSync = require('browser-sync').create();

function stream() {
  return browserSync.stream();
}

function reload() {
  return browserSync.reload({
    stream: true
  });
}

function serve() {
  browserSync.init(CONFIG.BROWSERSYNC_OPTIONS);
}

module.exports = {
  reload,
  serve,
  stream,
};