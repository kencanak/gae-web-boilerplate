# gae-web-boilerplate (Front-end)
A simple and boilerplate to build web application (vanilla + typescript) and deploy it to Google App Engine.

## Pre-requisite
* [Node](https://nodejs.org/en/) 12.3.1 / [npm](https://www.npmjs.com/) 6.9.0
    * Recommend installing with [nvm](https://github.com/creationix/nvm)
* [Gulp CLI](https://github.com/gulpjs/gulp-cli)

## Stacks
* Nunjucks
* Typescript
* SASS for CSS pre-processor
* Gulp
* BrowserSync

## Code structure
* `data` folder
    this folder contains nunjuck templating data.
    **To add new data for a new page:**
    1. you can simply create a new JSON file with the page name i.e. `about.json`.
    2. update `html` gulp task `gulp/task/html.js`, add the newly created JSON file reference (line 41 onwards)

    ```
    .pipe(
      data({
        // this is nunjucks template data
        global: getPageData('global'),
        home: getPageData('home'),
        about: getPageData('about'),
      })
    )
    ```
* `src` folder
    - **to create new page:**
      1. go to `src/pages`, create new page folder. i.e. `about`
      2. in `src/pages/about` folder, create new `index.njk`. with the following content:
      ```
      {% extends "base.njk" %}

      {% block meta_tag %}

      {% endblock %}

      {% block page_styles %}
        <link rel="stylesheet" href="/assets/css/[page name].css">
      {% endblock %}

      {% block content %}
      <div class="gwb-[page-name]">
        404
      </div>
      {% endblock %}


      {% block page_script %}
        <script src="/assets/js/[page-name].js"></script>
      {% endblock %}

      ```

      3. (OPTIONAL), create page's style + script in the same folder. i.e. `about.scss` and `about.ts`


      P.S: if there is no custom style/script needed, you can remove the page_styles + page_script block.


  - **Creating new component:**
      1. go to `src/components`, create new component folder. i.e. header
      2. in `src/components/header` folder, create new nunjucks template file called `header.njk` + `header.scss` (OPTIONAL)
      3. if there is component style, you might want to import it in `src/styles/index.scss`. otherwise, you can also import it in the respective page style file


```
.
+-- data
|   +-- global.json
|   +-- home.json
|   +-- robots.json
|   +-- sitemap.json
+-- gulp
|   +-- tasks
|       +-- browsersync.js
|       +-- clean.js
|       +-- copy.js
|       +-- critical-css.js
|       +-- csp-compliance-plugin.js
|       +-- csp-compliance.js
|       +-- html.js
|       +-- lint-sass.js
|       +-- lint-script.js
|       +-- observe.js
|       +-- robots.js
|       +-- scripts.js
|       +-- sitemap.js
|       +-- styles.js
|       +-- svg.js
|   +-- config.js
|   +-- utils.js
+-- src
|   +-- html
|       +-- components
|           +-- button
|               +-- button.njk
|               +-- button.scss
|           +-- any other components
|       +-- pages
|           +-- home
|               +-- index.njk
|               +-- home.scss
|               +-- home.ts
|           +-- 404
|               +-- index.njk
|               +-- 404.scss
|               +-- 404.ts (if needed)
|           +-- any other pages
|       +-- partials
|       +-- base.njk
|   +-- images
|       +-- any image assets
|   +-- misc
|       +-- robots.njk
|       +-- sitemap.njk
|   +-- scripts
|       +-- base.ts
|       +-- any other common scripts, e.g. utils
|   +-- styles
|       +-- base
|           +-- _base.scss
|           +-- _layout.scss
|           +-- _reset.scss
|           +-- _type.scss
|       +-- utils
|       +-- index.scss
|       +-- _common.scss
```

## Quickstart

### Dev
`npm run dev` and visit `http://localhost:3000`

### Build
`npm run build`
