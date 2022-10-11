import * as fs from 'fs';
import * as path from 'path';

const glob = require('glob');
const marked = require('marked');
const nunjucks = require('nunjucks');

import { getPageFiles, getTemplateFiles, SRC_FOLDER } from './utils';

const renderer = new marked.Renderer();

/**
 * Set options for marked package.
 * `gfm` needs to be `true` in order for `breaks: true` to work:
 * https://marked.js.org/using_advanced
 */
marked.setOptions({
  gfm: true,
  breaks: true,
});

const videoBlock = {
  name: 'videoBlock',
  level: 'block',
  start(src: string) {
    return src.match(/`(video|youtube): \[(.*?)\]\((.*?)\)`/)?.index;
  },
  tokenizer(src: string, tokens: any) {
    const rule = /^`(video|youtube): \[(.*?)\]\((.*?)\)`/; // Regex for the complete token, anchor to string start
    const match = rule.exec(src);
    if (match) {
      let type = match[1];
      return {
        // Token to generate
        type: 'videoBlock', // Should match "name" above
        raw: match[0],
        videoType: type,
        title: match[2],
        url: match[3],
      };
    }

    return null;
  },
  renderer(token: Record<string, any>) {
    switch (token.videoType) {
      case 'video':
        return `<h3>${token.title}</h3><div class="marked-video"><video src="${token.url}" preload="auto" autoplay="" style="width: 560px; height: 315px;"></video></div>`;
      case 'youtube':
        return `<div class="marked-video"><iframe width="560" height="315" src="https://www.youtube.com/embed/${token.url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      default:
        return '';
    }
  },
};

renderer.link = function (
  href: Record<string, any>,
  title: Record<string, any>,
  text: Record<string, any>
) {
  return `<a href="${href}" target="_blank">${text}</a>`;
};

// add custom extension for markdown
marked.use({extensions: [videoBlock], renderer: renderer});


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
      new nunjucks.FileSystemLoader([`./src`, `./src/components`, `./src/pages`, `./src/templates`])
    );
    nunjucksEnv.addFilter('json', JSON.stringify);
    nunjucksEnv.addFilter('markdown', (val: string) => {
      return `<div class="marked">${marked.parse(val)}</div>`;
    });

    const pageHTML: Array<any> = getPageFiles(/.*\.njk$/);

    pageHTML.forEach(async (page) => {
      const out = path.join(page.path === 'home' ? '' : page.path, 'index.html');

      const templateData = fs.readFileSync(page.entry, 'utf8');

      let pageData = {};
      const dataName = page.name.replace('page.', '');
      const pageDataPath = path.join(__dirname, '..', SRC_FOLDER, 'data', `${dataName}.json`);
      const globalDataPath = path.join(__dirname, '..', SRC_FOLDER, 'data', `global.json`);

      if (fs.existsSync(pageDataPath)) {
        pageData = JSON.parse(fs.readFileSync(pageDataPath, 'utf-8'));
      }

      let templateContent = nunjucksEnv.renderString(templateData, {
        global: JSON.parse(fs.readFileSync(globalDataPath, 'utf-8')),
        context: pageData,
      });

      compiler(
        out,
        templateContent,
      );
    });

    const templatesHTML: Array<any> = getTemplateFiles(/.*\.njk$/);

    templatesHTML.forEach(async (page) => {
      const templateDataPath = path.join(__dirname, '..', SRC_FOLDER, 'templates-data', `${page.path}.json`);
      let templateData: any = {};

      if (fs.existsSync(templateDataPath)) {
        templateData = JSON.parse(fs.readFileSync(templateDataPath, 'utf-8'));

        const parentSlug = templateData.parentSlug || '/';

        const template = fs.readFileSync(page.entry, 'utf8');
        const globalDataPath = path.join(__dirname, '..', SRC_FOLDER, 'data', `global.json`);

        // begin generating each page
        templateData.data.forEach(async (item: any) => {
          const out = path.join(parentSlug, item.slug, 'index.html');

          let templateContent = nunjucksEnv.renderString(template, {
            global: JSON.parse(fs.readFileSync(globalDataPath, 'utf-8')),
            context: item,
          });

          compiler(
            out,
            templateContent,
          );
        });
      }
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
        compilation.contextDependencies.add(path.resolve(__dirname, '..', SRC_FOLDER, 'data'));
        compilation.contextDependencies.add(path.resolve(__dirname, '..', SRC_FOLDER, 'templates'));
        compilation.contextDependencies.add(path.resolve(__dirname, '..', SRC_FOLDER, 'templates-data'));

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

        const templatesToWatch = glob.sync(
          path.join(__dirname, '..', SRC_FOLDER, 'templates', '**/*.njk'),
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

        const dataToWatch = glob.sync(
          path.join(__dirname, '..', SRC_FOLDER, 'data', '**/*.json'),
          {
            absolute: true,
          }
        );

        const templateDataToWatch = glob.sync(
          path.join(__dirname, '..', SRC_FOLDER, 'templates-data', '**/*.json'),
          {
            absolute: true,
          }
        );

        const filesToWatch = [
          ...pagesToWatch,
          ...componentToWatch,
          ...dataToWatch,
          ...templatesToWatch,
          ...templateDataToWatch,
        ];

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
