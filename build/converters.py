from werkzeug.routing import PathConverter, ValidationError


class IgnorePathConverter(PathConverter):

    def __init__(self, map, *items):
        super().__init__(map)
        self.items = items

    def to_python(self, value):
        for item in self.items:
            if value.lower().startswith(item.lower()):
                raise ValidationError()
        return value


class IncludePathConverter(PathConverter):

    def __init__(self, map, *items):
        super().__init__(map)
        self.items = items

    def to_python(self, value):
        for item in self.items:
            if value.lower().startswith(item.lower()):
                return value
        raise ValidationError()
