const CONFIG    = require('../config');
const svgSprite = require('gulp-svg-sprite');
const { dest }  = require('gulp');
const { src }   = require('gulp');

const options = {
  shape: {
    id: {
      separator: '',
    },
  },
  mode: {
    symbol: { // symbol mode to build the SVG
      dest: '.', // destination folder
      sprite: 'sprite.svg', // generated sprite name
      example: false, // Build a sample page,
      inline: true
    }
  },
  svg: {
    xmlDeclaration: false,
    transform: [
      /**
       * Custom sprite SVG transformation
       * @param {String} svg Sprite SVG
       * @return {String} Processed SVG
       */
      function(svg) {
        return svg.replace('svg', 'svg id="svg-sprite"');
      }
    ]
  }
}

function svg() {
  return src(`${CONFIG.SRC.SVG}/*.svg`)
    .pipe(svgSprite(options))
    .pipe(dest(CONFIG.DIST.SVG));
}

module.exports = svg;