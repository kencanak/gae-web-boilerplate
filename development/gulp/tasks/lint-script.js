'use strict';

const { src }   = require('gulp');
const eslint = require('gulp-eslint');
const CONFIG = require('../config');

function lintScript() {
  return src(CONFIG.SRC.TS)
    .pipe(eslint('.eslintrc.json'))
    .pipe(eslint.format());
}

module.exports = lintScript;

