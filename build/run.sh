#!/bin/bash
# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# ref: https://github.com/google/gae-secure-scaffold-python3/blob/master/examples/python-app/run.sh

set -o errexit -o nounset

FLASK_ENV="development"
FLASK_APP="main:app"

if [ -f ./.env ]; then
  export $(echo $(cat ./.env | sed 's/#.*//g'| xargs) | envsubst)
fi

# Start your local development server.
# export GOOGLE_CLOUD_PROJECT=$STAGING_APP_ID
export FLASK_SETTINGS_FILENAME="settings.py"
FLASK_ENV="$FLASK_ENV" FLASK_APP="$FLASK_APP" flask run