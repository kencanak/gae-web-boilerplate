#!/bin/bash

# throw error if failed
set -o errexit -o nounset

STAGING_APP_ID="[GCLOUD STAGING PROJECT ID]"
PRODUCTION_APP_ID="[GCLOUD PRODUCTION PROJECT ID]"

# sourcing nvm
. "$NVM_DIR/nvm.sh"

if [ -f ./build/.env ]; then
  export $(echo $(cat ./build/.env | sed 's/#.*//g'| xargs) | envsubst)
fi


case "$1" in
  dev)
    case "$2" in
      local-dev)
        echo "running local dev server"

        cd development
        nvm use

        npm install --legacy-peer-deps

        npm run dev
      ;;

      static-build)
        echo "running static"

        rm -rf build/dist

        # Build the static site
        cd development

        # make sure all packages are installed
        nvm use
        npm install --legacy-peer-deps

        rm -rf dist
        npm run build
        cd ..
        cp -R -f development/dist build/

        cd build

        rm -rf requirements.txt

        pip install virtualenv --require-hashes
        # prep api dev env
        virtualenv env -p python3 && source env/bin/activate && python -m pip install pip-tools && pip-compile --allow-unsafe --generate-hashes --resolver=backtracking requirements.in && pip install -r requirements.txt --require-hashes

        export GOOGLE_CLOUD_PROJECT=$STAGING_APP_ID

        ./run.sh
      ;;

      *)
        echo 'invalid dev environment (local-dev|static-build)'
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
        rm -rf build/dist

        # Build the static site
        cd development

        # make sure all packages are installed
        nvm use
        npm install --legacy-peer-deps

        # remove build folder
        rm -rf dist

        npm run build

        # go back to root folder
        cd ..

        cp -R -f development/dist build/

        cd build

        pip install virtualenv --require-hashes
        # prep build dev env
        virtualenv env -p python3 && source env/bin/activate && pip install -r requirements.txt --require-hashes

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

