const {
  src,
  dest,
} = require('gulp');

const cspCompliance = require('./csp-compliance-plugin');

const CONFIG = require('../config');

const csp = () => {
  return src(CONFIG.DIST.HTML)
    .pipe(cspCompliance())
    .pipe(dest(CONFIG.DIST.ROOT))
}

module.exports = {
  csp,
};
