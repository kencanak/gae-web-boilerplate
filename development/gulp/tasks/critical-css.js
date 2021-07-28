'use strict';

const { src, dest }   = require('gulp');
const critical = require('critical').stream;
const CONFIG = require('../config');

function criticalCss() {
  return src(CONFIG.DIST.HTML)
    .pipe(
      critical({
        base: CONFIG.DIST.ROOT,
        inline: true,
        css: [`${CONFIG.DIST.CSS}/*.css`],
      })
    )
    .on('error', err => {
      console.error(err.message);
    })
    .pipe(dest(CONFIG.DIST.ROOT));
}

module.exports = criticalCss;

