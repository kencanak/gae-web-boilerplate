# gae-web-boilerplate
A simple and boilerplate to build web application (vanilla + typescript) and deploy it to Google App Engine.

## Pre-requisite
1. Install and set up [nvm](https://github.com/nvm-sh/nvm) - _optional_
2. Install node version 14.19.1. `nvm install 14.19.1`
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
4. Webpack 5

## Code structure
Project divided into 2 section:

### development (front-end)
this is a typical vanilla web scafolding, any UI development should be done in this folder. For more info on how the front-end code being structured, please refer to `development/README.md`

### back-end
Typical Flask app code structure. This can be expanded, should you need to add API end points, you could simply create a new folder called `API`, and add `views.py` + `__init__.py` and update flask blueprint.

## Quick start on setting env variables
to set gcloud project id, you can either:
1. go to `build`
2. create `.env` file
3. set both staging and production gcloud app id
```
STAGING_APP_ID="[GCLOUD STAGING PROJECT ID]"
PRODUCTION_APP_ID="[GCLOUD PRODUCTION PROJECT ID]"
```

NOTE: by default, `.env` file will be ignored

OR
1. open `./run.sh`
2. update the variable value of
```
STAGING_APP_ID="[GCLOUD STAGING PROJECT ID]"
PRODUCTION_APP_ID="[GCLOUD PRODUCTION PROJECT ID]"
```
3. go to `./build/run.sh`, update GCLOUD_PROJECT_ID to your staging gcloud app ID

NOTE: it's recommended to go by the first approach

## Quick start on local dev (front-end development)
1. open terminal, run `./run.sh dev local-dev`
3. visit `http://localhost:3000`

## Quick start on local dev (build development, on top of securescaffold settings)
1. open terminal, run `./run.sh dev static-build`
3. visit `http://localhost:5000`

P.S. this is useful to test the CSP rules, making sure style are applied correctly

## Deployment
1. open terminal, run `./run.sh deploy -m app -t (staging|production)`

NOTE:
make sure your user account has the following access role:
- App Engine Deployer
- Cloud Build Editor
- Service Account User
- Storage Object Admin

you can go to [GCloud console](https://console.cloud.google.com/iam-admin/iam?serviceId=default&project=[PROJECT_ID]), to assign the roles

## Docker
This serves as a testing ground for experiments. The primary goal is to ensure compatibility with various machines during development. I've noticed challenges in properly installing packages on different machines, particularly between non-silicon and silicon Mac devices.

### Pre-requisite
- install docker engine [ref](https://docs.docker.com/engine/install/)

### NOTE:
- Using the combination of the `--build` and `--force-recreate` flags ensures that the system consistently fetches the most recent updates, rebuilds the image, and executes it.
- BEFORE running local static build / deployment, make sure you are logged in into gcloud.

### running local dev (with HOT RELOAD)
`docker compose -f docker-compose-dev.yaml -p dev-docker up --build --force-recreate`

### running local static build (WITHOUT HOT RELOAD)
`docker compose -f docker-compose-static-dev.yaml -p dev-docker up --build --force-recreate`

### deploying (NOT TESTED, YET)
technically, this should be handled by the pipelines, i.e github action. should you need to run the build locally, you will need to:
- build the docker image `docker build -t [name] .`
- run the docker image, `docker run -d [name] --mount ~/.config/gcloud:/root/.config/gcloud deploy -m [app/module name] -t [staging/production]`

