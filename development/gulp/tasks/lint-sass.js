'use strict';

const { src }   = require('gulp');
const gulpStylelint = require('gulp-stylelint');

const CONFIG = require('../config');

function lintSass() {
  return src(CONFIG.SRC.CSS)
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
}

module.exports = lintSass;
