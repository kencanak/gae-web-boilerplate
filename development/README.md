# gae-web-boilerplate (Front-end)
A simple and boilerplate to build web application (vanilla + typescript) and deploy it to Google App Engine.

## Pre-requisite
* [Node](https://nodejs.org/en/) 14.19.1 / [npm](https://www.npmjs.com/) 6.14.16
    * Recommend installing with [nvm](https://github.com/creationix/nvm)
* [Webpack] 5.70.0 (https://webpack.js.org/)

## Stacks
* Nunjucks
* Typescript
* SASS for CSS pre-processor
* Webpack 5
* BrowserSync

## Built-in nunjucks filter
1. markdown
    - this filter will convert markdown content to markup content
    - to use {{ content | markdown | safe }}
    - youtube video embed support, if content format ``youtube: [Google Unconscious Bias Journey](_KfKmGb_bT4)``, this will render youtube iframe embed
2. json
    - this filter will convert string to JSON object
    - to use {{ content | json }}
3. budouJA
    - this filter will spit out a legible line break for Japanese language. [ref](https://github.com/google/budoux/tree/main/javascript/)
    - to use {{ content | budouJA | safe }}
4. budouZH
    - this filter will spit out a legible line break for Chinese language. [ref](https://github.com/google/budoux/tree/main/javascript/)
    - to use {{ content | budouZH | safe }}

## Code build
by default:
- all page build will be built with CSP compliance (i.e. applying nonce etc). to disable:
  ```
  1. go to webpack.config.prod.ts
  2. new HTMLCleanUp({
    cspCompliance: false,
    criticalCSS: {},
    purgeCSS: {},
  }),
  ```
- all page build will be built with critical CSS, to disable:
  ```
   1. go to webpack.config.prod.ts
   2. new HTMLCleanUp({
      cspCompliance: false,
      criticalCSS: null,
      purgeCSS: {},
   }),
   ```

  for more details on what options available, go to [here](https://github.com/GoogleChromeLabs/critters#readme)
- all page build will be built with purgeCSS, to disable:
  ```
   1. go to webpack.config.prod.ts
   2. new HTMLCleanUp({
      cspCompliance: false,
      criticalCSS: {},
      purgeCSS: null,
   }),
   ```

   for more details on what options available, go to [here](https://purgecss.com/introduction.html)


## Code structure
* `data` folder
    this folder contains nunjuck templating data.
    **To add new data for a new page:**
    1. you can simply create a new JSON file with the page name i.e. `about.json`.
    2. you should be able to access the page data from `context` object.
* `templates-data` folder
    this folder contains nunjuck page templates data.
    **To add new data for a new template:**
    1. you can simply create a new JSON file with the template name
    2. it's imperative to follow the following structure
    ```
    {
      "parentSlug": "[the parent of the page template, if any, otherwise leave it blank]",
      "data": [
        {
          "slug": [page slug],
          ... the rest of template context data
        },
        {
          "slug": [page slug],
          ... the rest of template context data
        }
      ]
    }
    ```
    2. you should be able to access the page data from `context` object.

* `src` folder
    - **to create new page:**
      1. go to `src/pages`, create new page folder. i.e. `about`
      2. in `src/pages/about` folder, create new `page.about.njk`. with the following content:
      ```
      {% extends "base.njk" %}

      {% block meta_tag %}

      {% endblock %}

      {% block third_party_styles %}
      {% endblock %}

      {% block page_styles %}
        <link rel="stylesheet" href="css/404.css">
      {% endblock %}

      {% block header %}
      {% endblock %}

      {% block main %}
      <div class="app-about">
        [content]
      </div>
      {% endblock %}

      {% block footer %}
      {% endblock %}

      {# additional component i.e snackbar + loader #}
      {% block additional_components %}
      {% endblock %}

      {% block third_party_scripts %}
      {% endblock third_party_scripts %}

      {% block page_scripts %}
      {# <script src="js/404.js"></script> #}
      {% endblock %}


      ```

      3. (OPTIONAL), create page's style + script in the same folder. i.e. `about.scss` and `about.ts`


      P.S: if there is no custom style/script needed, you can remove the page_styles + page_scripts block.

  - **to create new template:**
      1. go to `src/tempates`, create new page folder. i.e. `random-template`
      2. in `src/tempates/random-template` folder, create new `template.random-template.njk`. with the following content:
      ```
      {% extends "base.njk" %}

      {% block meta_tag %}

      {% endblock %}

      {% block third_party_styles %}
      {% endblock %}

      {% block page_styles %}
        <link rel="stylesheet" href="css/404.css">
      {% endblock %}

      {% block header %}
      {% endblock %}

      {% block main %}
      <div class="app-about">
        [content]
      </div>
      {% endblock %}

      {% block footer %}
      {% endblock %}

      {# additional component i.e snackbar + loader #}
      {% block additional_components %}
      {% endblock %}

      {% block third_party_scripts %}
      {% endblock third_party_scripts %}

      {% block page_scripts %}
      {# <script src="js/404.js"></script> #}
      {% endblock %}


      ```

      3. (OPTIONAL), create page's style + script in the same folder. i.e. `random-template.scss` and `random-template.ts`


      P.S: if there is no custom style/script needed, you can remove the page_styles + page_scripts block.


  - **Creating new component:**
      1. go to `src/components`, create new component folder. i.e. header
      2. in `src/components/header` folder, create new nunjucks template file called `header.njk` + `header.scss` (OPTIONAL)
      3. if there is component style, you might want to import it in `src/styles/index.scss`. otherwise, you can also import it in the respective page style file

  - **Loading SVG:**
      1. go to `src/svgs`, add svg file
      2. in page/base typescript file, import the respective svg. e.g. `import '../../svgs/icon-cancel.svg';`
      3. in markup, load the svg, note on the file path `svg/sprite.svg`
      ```
      <svg>
        <use xlink:href="svg/sprite.svg#icon-cancel"></use>
      </svg>
      ```

```
.
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .prettierrc.js
├── .stylelintrc.yaml
├── README.md
├── package-lock.json
├── package.json
├── src
│   ├── base.njk
│   ├── base.scss
│   ├── base.ts
│   ├── components
│   │   ├── .DS_Store
│   │   └── button
│   │       ├── button.njk
│   │       └── button.scss
│   ├── data
│   │   ├── global.json
│   │   ├── home.json
│   │   ├── robots.json
│   │   ├── sitemap.json
│   │   └── sub-page-child.json
│   ├── images
│   │   └── apes.gif
│   ├── pages
│   │   ├── 404
│   │   │   ├── 404.scss
│   │   │   ├── 404.ts
│   │   │   └── page.404.njk
│   │   ├── home
│   │   │   ├── home.scss
│   │   │   ├── home.ts
│   │   │   └── page.home.njk
│   │   └── sub-page
│   │       ├── page.sub-page.njk
│   │       └── sub-page-child
│   │           ├── page.sub-page-child.njk
│   │           ├── sub-page-child.scss
│   │           └── sub-page-child.ts
│   ├── robots-sitemap
│   │   ├── robots.txt.njk
│   │   └── sitemap.xml.njk
│   ├── styles
│   │   ├── _common.scss
│   │   ├── _layout.scss
│   │   ├── _typography.scss
│   │   ├── _utils.scss
│   │   └── _variables.scss
│   ├── svgs
│   │   ├── icon-cancel.svg
│   │   ├── icon-checked.svg
│   │   ├── icon-close.svg
│   │   └── icon-help.svg
│   ├── templates
│   │   ├── test-template
│   │   │   ├── template.test-template.njk
│   │   │   └── test-template.ts
│   │   └── test-template-sub
│   │       ├── template.test-template-sub.njk
│   │       └── test-template-sub.ts
│   ├── templates-data
│   │   ├── test-template-sub.json
│   │   └── test-template.json
│   └── utils
│       └── api.ts
├── tsconfig.json
├── webpack-plugins
│   ├── html-cleanup.ts
│   ├── nunjucks-build.ts
│   ├── nunjucks-non-html-build.ts
│   └── utils.ts
├── webpack.config.prod.ts
└── webpack.config.ts

```

## Quickstart

### Dev
`npm run dev` and visit `http://localhost:3000`

### Build
`npm run build`
