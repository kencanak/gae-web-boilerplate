import * as fs from 'fs';
import * as path from 'path';

const glob = require('glob');
const marked = require('marked');
const nunjucks = require('nunjucks');

import { getPageFiles, SRC_FOLDER } from './utils';

/**
 * Set options for marked package.
 * `gfm` needs to be `true` in order for `breaks: true` to work:
 * https://marked.js.org/using_advanced
 */
marked.setOptions({
  gfm: true,
  breaks: true,
});


export default class NunjucksBuild {
  files: Array<any> = [];
  paths: Array<any> = [];
  // Any options should be passed in the constructor of your plugin,
  // (this is a public API of your plugin).
  constructor(options = {}) {
    // Applying user-specified options over the default options
    // and making merged options further available to the plugin methods.
    // You should probably validate all the options here as well.
  }

  _rebuildPage(compiler: any) {
    // TODO: refactor this
    // in order to make hot reload properly, i.e. should re-compile when component
    // gets update, we need to use new nunjucks env
    nunjucks.configure({
      watch: false,
      noCache: true,
    });

    const nunjucksEnv = new nunjucks.Environment(
      new nunjucks.FileSystemLoader([`./src`, `./src/components`, `./src/pages`])
    );
    nunjucksEnv.addFilter('json', JSON.stringify);
    nunjucksEnv.addFilter('markdown', marked.parse);

    const pageHTML: Array<any> = getPageFiles(/.*\.njk$/);

    pageHTML.forEach(async (page) => {
      const out = path.join(page.path === 'home' ? '' : page.path, 'index.html');

      const templateData = fs.readFileSync(page.entry, 'utf8');

      let pageData = {};
      const pageDataPath = path.join(__dirname, '..', SRC_FOLDER, 'data', `${page.name}.json`);
      const globalDataPath = path.join(__dirname, '..', SRC_FOLDER, 'data', `global.json`);

      if (fs.existsSync(pageDataPath)) {
        pageData = JSON.parse(fs.readFileSync(pageDataPath, 'utf-8'));
      }

      let templateContent = nunjucksEnv.renderString(templateData, {
        global: JSON.parse(fs.readFileSync(globalDataPath, 'utf-8')),
        [page.name]: pageData,
      });

      compiler(
        out,
        templateContent,
      );
    });
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

    compiler.hooks.make.tapAsync(
      'NunjucksBuildWebpackPlugin',
      (compilation: any, callback: Function) => {
        compilation.contextDependencies.add(path.resolve(__dirname, '..', SRC_FOLDER, 'components'));
        compilation.contextDependencies.add(path.resolve(__dirname, '..', SRC_FOLDER, 'pages'));

        callback();
      }
    );

    // add file to watch
    compiler.hooks.afterCompile.tapAsync(
      'NunjucksBuildWebpackPlugin',
      (compilation: any, callback: Function) => {
        const pagesToWatch = glob.sync(
          path.join(__dirname, '..', SRC_FOLDER, 'pages', '**/*.njk'),
          {
            absolute: true,
          }
        );

        const componentToWatch = glob.sync(
          path.join(__dirname, '..', SRC_FOLDER, 'components', '**/*.njk'),
          {
            absolute: true,
          }
        );

        const filesToWatch = [...pagesToWatch, ...componentToWatch];

        filesToWatch.filter((f: string) => !this.files.includes(f)).forEach((f: string) => {
          if (Array.isArray(compilation.fileDependencies)) {
            compilation.fileDependencies.push(f);
          } else {
            compilation.fileDependencies.add(f);
          }
        });

        this.files = [...filesToWatch];

        callback();
      }
    );

    // Specify the event hook to attach to
    compiler.hooks.emit.tapAsync(
      'NunjucksBuildWebpackPlugin',
      (compilation: any, callback: Function) => {
        this._rebuildPage((out: string, templateContent: string) => {
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
