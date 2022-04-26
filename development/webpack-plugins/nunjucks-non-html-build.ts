import * as fs from 'fs';
import * as path from 'path';

const Critters = require('critters');
const glob = require('glob');
const marked = require('marked');
const nunjucks = require('nunjucks');

import { getPageFiles, SRC_FOLDER } from "./utils";

/**
 * Set options for marked package.
 * `gfm` needs to be `true` in order for `breaks: true` to work:
 * https://marked.js.org/using_advanced
 */
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default class NunjucksNonHTMLBuild {
  // Any options should be passed in the constructor of your plugin,
  // (this is a public API of your plugin).
  constructor(options = {}) {
    // Applying user-specified options over the default options
    // and making merged options further available to the plugin methods.
    // You should probably validate all the options here as well.
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

    // add file to watch
    compiler.hooks.afterCompile.tapAsync(
      'NunjucksNonHTMLBuildWebpackPlugin',
      (compilation: any, callback: Function) => {
        const filesToWatch = glob.sync(
          path.join(__dirname, '..', SRC_FOLDER, 'robots-sitemap', '**/*.njk'),
          {
            absolute: true,
          }
        );

        filesToWatch.forEach((f: string) => {
          compilation.fileDependencies.add(f);
        });

        callback();
      }
    );

    // Specify the event hook to attach to
    compiler.hooks.emit.tapAsync(
      'NunjucksNonHTMLBuildWebpackPlugin',
      (compilation: any, callback: Function) => {
        nunjucks.configure({
          watch: false,
          noCache: true,
        });

        // TODO: refactor this
        // in order to make hot reload properly, i.e. should re-compile when component
        // gets update, we need to use new nunjucks env
        const nunjucksEnv = new nunjucks.Environment(
          new nunjucks.FileSystemLoader([`./src`, `./src/robots-sitemap`])
        );

        const filesToWatch = glob.sync(
          path.join(__dirname, '..', SRC_FOLDER, 'robots-sitemap', '**/*.njk'),
          {
            absolute: true,
          }
        );

        const robotsDataPath = path.join(__dirname, '..', SRC_FOLDER, 'data', `robots.json`);
        const sitemapDataPath = path.join(__dirname, '..', SRC_FOLDER, 'data', `sitemap.json`);
        const globalDataPath = path.join(__dirname, '..', SRC_FOLDER, 'data', `global.json`);

        filesToWatch.forEach(async (file: any) => {
          const out = path.basename(file).replace('.njk', '');

          const templateData = fs.readFileSync(file, 'utf8');

          let templateContent = nunjucksEnv.renderString(
            templateData, {
              global: JSON.parse(fs.readFileSync(globalDataPath, 'utf-8')),
              robots: JSON.parse(fs.readFileSync(robotsDataPath, 'utf-8')),
              sitemap: JSON.parse(fs.readFileSync(sitemapDataPath, 'utf-8')),
            },
          );

          compilation.emitAsset(
            out,
            new RawSource(templateContent)
          );
        });

        callback();
      }
    );
  }
}
