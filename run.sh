#!/bin/bash

# throw error if failed
set -o errexit -o nounset

STAGING_APP_ID="[GCLOUD STAGING PROJECT ID]"
PRODUCTION_APP_ID="[GCLOUD PRODUCTION PROJECT ID]"

# sourcing nvm
. "$NVM_DIR/nvm.sh"


case "$1" in
  dev)
    case "$2" in
      local-dev)
        echo "running local dev server"

        cd development
        nvm use 14.19.0

        npm install

        npm run dev
      ;;

      static-build)
        echo "running static"

        # Build the static site
        cd development

        # make sure all packages are installed
        nvm use 14.19.0
        npm install

        rm -rf dist
        npm run build
        cd ..
        cp -R -f development/dist build/

        cd build
        # prep api dev env
        virtualenv env -p python3 && source env/bin/activate && pip install -r requirements.txt

        export GOOGLE_CLOUD_PROJECT=$STAGING_APP_ID

        ./run.sh
      ;;

      *)
        echo 'invalid dev environment (build|static)'
        exit 1
      ;;

    esac

    ;;

  deploy)
    target=""
    module=""
    APP_ID=""

    # shift first args
    shift

    # get deployment args
    while getopts m:t: flag
    do
      case "${flag}" in
        m)
          module=${OPTARG}

          ;;

        t)
          target=${OPTARG}

          ;;

      esac
    done

    echo "target deployment: $target"
    echo "deployment module: $module"

    case "$target" in
      production)
        APP_ID=$PRODUCTION_APP_ID

        ;;

      staging)
        APP_ID=$STAGING_APP_ID

        ;;

    esac

    if [ "$APP_ID" = "" ]; then
      echo 'invalid target deployment (staging|production)'
      exit 1
    fi

    deployment_version=$(date +%s)


    case "$module" in
      app)
        # Build the static site
        cd development

        # make sure all packages are installed
        nvm use 14.19.0
        npm install

        # remove build folder
        rm -rf dist

        npm run build

        # go back to root folder
        cd ..

        cp -R -f development/dist build/

        cd build

        # prep build dev env
        virtualenv env -p python3 && source env/bin/activate && pip install -r requirements.txt

        # run linting
        env/bin/python -m flake8

        # Deploy to appengine
        gcloud app deploy app.yaml --no-promote --version=$deployment_version --project=$APP_ID --quiet

        ;;

      *)
        echo 'invalid module (app)'
        exit 1

        ;;

    esac

    ;;
esac

