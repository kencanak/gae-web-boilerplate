import * as fs from 'fs';
import * as path from 'path';

const cheerio = require('cheerio');
const Critters = require('critters');
const glob = require('glob');
const { minify } = require('html-minifier-terser');

import { DIST_FOLDER, MANIFEST_PATH } from "./utils";

interface CriticalCSSOptions {
  path?: string,
  publicPath?: string,
  external?: boolean,
  inlineThreshold?: number,
  minimumExternalSize?: number,
  pruneSource?: boolean,
  mergeStylesheets?: boolean,
  additionalStylesheets?: Array<string>,
  preload?: string,
  noscriptFallback?: boolean,
  inlineFonts?: boolean,
  preloadFonts?: boolean,
  fonts?: boolean,
  keyframes?: string,
  compress?: boolean,
  logLevel?: string,
  logger?: any,
};

interface HTMLCleanUpOptions {
  criticalCSS?: boolean | CriticalCSSOptions,
  cspCompliance?: boolean,
};

export default class HTMLCleanUp {
  static defaultOptions = {
    criticalCSS: {
      // critters option ref: https://github.com/GoogleChromeLabs/critters#properties
      path: path.join(__dirname, '..', DIST_FOLDER),
      publicPath: path.join(__dirname, '..', DIST_FOLDER, 'css'),
    },
    cspCompliance: true,
  };

  options: HTMLCleanUpOptions = {};
  critters: any;
  manifest: any;

  // Any options should be passed in the constructor of your plugin,
  // (this is a public API of your plugin).
  constructor(options: HTMLCleanUpOptions = {}) {
    // Applying user-specified options over the default options
    // and making merged options further available to the plugin methods.
    // You should probably validate all the options here as well.
    this.options = {
      ...HTMLCleanUp.defaultOptions,
    };

    if (options.criticalCSS && typeof options.criticalCSS === 'object') {
      this.options.criticalCSS = {
        ...HTMLCleanUp.defaultOptions.criticalCSS,
        ...options.criticalCSS,
      };
      this.critters = new Critters(this.options.criticalCSS);
    }

    if (typeof options.cspCompliance === 'boolean') {
      this.options.cspCompliance = options.cspCompliance;
    }
  }

  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler: any) {
    // webpack module instance can be accessed from the compiler object,
    // this ensures that correct version of the module is used
    // (do not require/import the webpack or any symbols from it directly).
    const { webpack } = compiler;

    // Compilation object gives us reference to some useful constants.
    const { Compilation } = webpack;

    // RawSource is one of the "sources" classes that should be used
    // to represent asset sources in compilation.
    const { RawSource } = webpack.sources;

    // Specify the event hook to attach to
    compiler.hooks.done.tapAsync(
      'HTMLCleanUpWebpackPlugin',
      (compilation: any, callback: Function) => {
        if (!this.manifest) {
          this.manifest = require(MANIFEST_PATH);
        }

        const filesToWatch = glob.sync(path.join(__dirname, '..', DIST_FOLDER, '**/*.html'), {
          absolute: true,
        });

        const svgSpriteFiles = glob.sync(path.join(__dirname, '..', DIST_FOLDER, 'svg/*.svg'), {
          absolute: true,
        });

        const svgContent: Array<string> = [];

        if (svgSpriteFiles.length) {
          svgSpriteFiles.forEach((svgFile: string) => {
            const temp = fs.readFileSync(svgFile, 'utf8');
            svgContent.push(temp);
          });
        }

        filesToWatch.forEach(async (f: string) => {
          let templateContent = fs.readFileSync(f, 'utf8');

          // TODO: find better approach
          if (svgContent.length) {
            const re = new RegExp(`svg\/sprite.svg`, 'g');

            templateContent = templateContent.replace(re, '');
          }

          // update hash name on css/js
          Object.keys(this.manifest).forEach((item) => {
            const re = new RegExp(`(css|js)\/${item}`);

            templateContent = templateContent.replace(re, this.manifest[item]);
          });

          let $ = cheerio.load(templateContent);

          // inject svg sprites to page
          $('body').prepend(`
            <div aria-hidden="true" class="svg-sprite">
              ${svgContent.join('')}
            </div>
          `);

          templateContent = $.html();

          // begin critical css
          if (this.critters) {
            templateContent = await this.critters.process(templateContent);
          }

          // begin csp compliance
          if (this.options.cspCompliance) {
            // reload the latest template content
            $ = cheerio.load(templateContent);

            // search for style tag, inject nonce
            $('style').attr('nonce', '{{csp_nonce()}}');

            // search for link with rel preload
            $('link').each((i: number, elem: HTMLElement) => {
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

              if (rel === 'stylesheet') {
                $(elem).attr('nonce', '{{csp_nonce()}}');
              }

              // not to use manifest json cdn
              // Temp: Remove manifest to resolve google corp CORS error
              if (rel === 'manifest') {
                //$(elem).attr('href', '/manifest.json');
                $(elem).remove();
              }
            });

            // add nonce value for inline script
            $('script').each((i: number, elem: HTMLElement) => {
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

            const inlineStyles: Array<string> = [];
            $('[style]').each((i: number, elem: HTMLElement) => {
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

            templateContent = $.html();
          }

          templateContent = await minify(templateContent, {
            keepClosingSlash: true,
          });

          fs.writeFileSync(f, templateContent);
        });

        // remove manifest file, as no longer needed
        fs.unlinkSync(MANIFEST_PATH);

        callback();
      }
    );
  }
}
