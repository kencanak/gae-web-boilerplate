import google.cloud.logging

from frontend.views import frontend
from app import app
from flask import render_template

# Instantiates a client
client = google.cloud.logging.Client()

# Retrieves a Cloud Logging handler based on the environment
# you're running in and integrates the handler with the
# Python logging module. By default this captures all logs
# at INFO level and higher
client.get_default_handler()
client.setup_logging()

app.register_blueprint(frontend)


@app.route('/_ah/warmup')
def warmup():
    # Handle your warmup logic here, e.g. set up a database connection pool
    return '', 200, {}


@app.errorhandler(404)
def not_found(_error):
    """
    The 404 page is built by bracket so we have to link to the dist
    file it is built in.

    This is quite vulnerable as a result.

    See static_site/src/pages.py:NotFoundPage for where this is
    defined.
    """
    return render_template("404/index.html"), 404
