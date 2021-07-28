# gae-web-boilerplate
A simple and boilerplate to build web application (vanilla + typescript) and deploy it to Google App Engine.

## Pre-requisite
1. Install and set up [nvm](https://github.com/nvm-sh/nvm) - _optional_
2. Install node version 12.3.1. `nvm install 12.3.1`
3. [Install gcloud SDK](https://cloud.google.com/sdk/docs/install) and then [initialize it](https://cloud.google.com/sdk/docs/initializing) with `gcloud auth login` and `gcloud auth application-default login`.
4. After installing the Google Cloud SDK, run `gcloud components install app-engine-python` and `gcloud components install app-engine-python-extras` to install the App Engine Cloud Components

## Stacks
### Build
1. GAE secure scaffold
2. Flask

### Front-end Development
1. Nunjucks
2. Typescript
3. SASS for CSS pre-processor
4. Gulp
5. BrowserSync
