const clean = require('./gulp/tasks/clean');
const copy = require('./gulp/tasks/copy');
const { html } = require('./gulp/tasks/html');
const observe = require('./gulp/tasks/observe');
const scripts = require('./gulp/tasks/scripts');
const lintScript = require('./gulp/tasks/lint-script');
const styles = require('./gulp/tasks/styles');
const lintSass = require('./gulp/tasks/lint-sass');
const criticalCss = require('./gulp/tasks/critical-css');
const svg = require('./gulp/tasks/svg');
const { robots } = require('./gulp/tasks/robots');
const { sitemap } = require('./gulp/tasks/sitemap');
const { csp } = require('./gulp/tasks/csp-compliance');
const {
  serve
} = require('./gulp/tasks/browsersync');
const {
  parallel
} = require('gulp');
const {
  series
} = require('gulp');

const compile = series(clean, parallel(svg, copy), parallel(lintSass, lintScript), styles, scripts, html, parallel(robots, sitemap));

const build = series(compile, criticalCss, csp);

const dev = series(compile, observe, serve);

exports.default = dev;

exports.build = build;
exports.copy = copy;
exports.css = styles;
exports.lintSass = lintSass;
exports.criticalCss = criticalCss;
exports.html = html;
exports.js = scripts;
exports.lintScript = lintScript;
exports.serve = dev;
exports.svg = svg;
exports.robots = robots;
exports.sitemap = sitemap;
exports.csp = csp;
