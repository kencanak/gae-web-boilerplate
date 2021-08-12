import securescaffold
from converters import IgnorePathConverter, IncludePathConverter

app = securescaffold.create_app(__name__, static_folder='dist', template_folder='dist')

app.url_map.converters['ignore'] = IgnorePathConverter
app.url_map.converters['include'] = IncludePathConverter
