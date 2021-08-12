import logging
from flask import Blueprint, render_template, make_response

logger = logging.getLogger(__name__)


IGNORED_PATHS = (
    'assets',
)


IGNORED_FILE_EXT = (
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico',
    '.map',
    '.json',
    '.txt',
    '.xml'
)

NO_CACHE_FILES = (
)


frontend = Blueprint(
    'static',
    __name__,
    static_folder='../dist',
    template_folder='../dist'
)


def _setNoCacheHeader(res):
    res.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    res.headers['Pragma'] = 'no-cache'
    res.headers['Expires'] = '0'
    res.cache_control.max_age = 0
    res.cache_control.public = False
    return res


def get_file_path_from_url(url: str) -> str:
    """
    All pages on the site are served as static files.

    This function converts a URL into a filepath from the dist folder.
    """
    if '.' not in url:
        url = f'{url}/index.html'

    return url


@frontend.route('/')
def home():
    res = _setNoCacheHeader(
        make_response(render_template('index.html'))
    )
    return res


@frontend.route(f'/<ignore({",".join(IGNORED_PATHS)}):path>', defaults={'path': ''})
@frontend.route('/<ignore({",".join(IGNORED_PATHS)}):path>')
def serve(path):
    if path.endswith(IGNORED_FILE_EXT):
        print('return static file')

        if path.endswith(NO_CACHE_FILES):
            res = _setNoCacheHeader(
                make_response(frontend.send_static_file(path))
            )
            return res

        return frontend.send_static_file(path)

    res = _setNoCacheHeader(
        make_response(render_template(get_file_path_from_url(path)))
    )
    return res
