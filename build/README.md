# gae-project-pseudo (Python - Flask)

This is the Gcloud App-engine bit of the app

It is built using Python 3 + Flask + secure scaffold.

## Development

### Setup

As we're using Python 3 make sure you have it
installed. You can find it at
[https://www.python.org/downloads/](https://www.python.org/downloads/).

Create a Python 3 virtualenv with:

    virtualenv env -p python3

Activate the env:

    source env/bin/activate

And install the dependencies:

    pip install -r requirements.txt --require-hashes

Build the static page (if it's not done yet):

    cd ../development && npm run build

Copy the build folder over from the development with:

    cp -r ../development/dist dist

Then all you need to do is run:

    ./run.sh

This will run a webserver at
[localhost:5000](localhost:5000).

