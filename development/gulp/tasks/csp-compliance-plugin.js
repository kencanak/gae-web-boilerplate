'use strict';

const PluginError = require('plugin-error');
const cheerio = require('cheerio');
const through = require('through2');

const PLUGIN_NAME = 'gulp-csp-compliance';

module.exports = () => {
  return through.obj((file, encoding, callback) => {
    if (file.isNull()) {
      // nothing to do
      return callback(null, file);
    }

    if (file.isStream()) {
      // file.contents is a Stream - https://nodejs.org/api/stream.html
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));

      // or, if you can handle Streams:
      //file.contents = file.contents.pipe(...
      //return callback(null, file);
    } else if (file.isBuffer()) {
      let contents = file.contents.toString();

      const $ = cheerio.load(contents);

      // search for style tag, inject nonce
      $('style').attr('nonce', '{{csp_nonce()}}');

      // search for link with rel preload
      $('link').each((i, elem) => {
        const rel = $(elem).attr('rel');
        const asAttr = $(elem).attr('as');

        if (rel === 'preload' && asAttr === 'style') {
          $(elem).attr('nonce', '{{csp_nonce()}}');
        }
        // if (rel === 'preload' && asAttr === 'style') {
        //   $(elem).attr('rel', 'stylesheet');

        //   $(elem).removeAttr('as');

        //   // remove onload script
        //   $(elem).removeAttr('onload');
        //   // $(elem).attr('nonce', '{{csp_nonce()}}');
        // }

        // remove onload script
        $(elem).removeAttr('onload');

        if (rel === 'stylesheet') {
          $(elem).attr('nonce', '{{csp_nonce()}}');
        }

        // not to use manifest json cdn
        if (rel === 'manifest') {
          $(elem).attr('href', '/manifest');
        }
      });

      // add nonce value for inline script
      $('script').each((i, elem) => {
        const src = $(elem).attr('src');

        if (!src) {
          $(elem).attr('nonce', '{{csp_nonce()}}');
        }
      });

      // get all elements with inline style attr
      // move it to style block, assign a class
      // this is to avoid csp error
      // NOTE: not sure if it will break the component behavior
      // to be tested

      const inlineStyles = [];
      $('[style]').each((i, elem) => {
        const className = `inline-style-${i}`;

        const elemStyle = $(elem).attr('style');
        inlineStyles.push(`.${className} {${elemStyle}}`);

        const currentClass = $(elem).attr('class')

        $(elem).attr('class', `${currentClass || ''} ${className}`);
        $(elem).removeAttr('style');
      });

      $('head').append(
        `<style nonce="{{csp_nonce()}}">${inlineStyles.join(' ')}</style>`
      );

      file.contents = Buffer.from($.html());

      return callback(null, file);
    }
  });
};
