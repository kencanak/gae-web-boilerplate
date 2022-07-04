import os

# Variables with all-capitals will be added to the Flask app's configuration.

# See https://github.com/GoogleCloudPlatform/flask-talisman for details on
# configuring CSP.

# Strict policy, allows using nonce in templates to load JS and CSS assets.

CSP_POLICY = {
    "default-src": "'self'",
    "object-src": "'none'",
    "base-uri": "'none'",
    "frame-src": [
        "'self'",
        "https://apis.google.com",
        "https://accounts.google.com",
        "https://*.googleapis.com"
    ],
    "connect-src": [
        "'self'",
        "https://www.gstatic.com",
        "https://*.googleapis.com"
    ],
    "script-src": [
        "'self'",
        "https://www.gstatic.com",
        "https://www.google-analytics.com",
        "https://*.googleapis.com",
        "https://apis.google.com"
    ],
    "style-src": [
        "'self'",
        "https://www.gstatic.com",
        "https://fonts.gstatic.com/",
        "https://fonts.googleapis.com/",
        "https://storage.googleapis.com/",
    ],
    "img-src": [
        "'self'",
        "https://www.google-analytics.com",
        "https://ssl.gstatic.com",
        "https://www.gstatic.com",
        "https://www.google.com",
        "lh3.googleusercontent.com",
        "https://storage.googleapis.com",
        "https://*.googleapis.com",
        "data:"
    ],
    "font-src": [
        "'self'",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com",
        "data:"
    ],
}

CSP_POLICY_NONCE_IN = ["script-src", "style-src"]

SECRET_KEY = 'guff'

GCP_ID = os.environ.get('GOOGLE_CLOUD_PROJECT')
