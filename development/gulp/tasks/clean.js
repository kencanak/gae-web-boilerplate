const CONFIG = require('../config');
const del    = require('del');

function clean() {
  return del([CONFIG.DIST.ROOT]);
}

module.exports = clean;