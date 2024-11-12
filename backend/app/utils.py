from marshmallow import Schema, fields, ValidationError

class NoteSchema(Schema):
    note = fields.Str(required=True)

def validate_input(data, schema):
    try:
        schema().load(data)
    except ValidationError as err:
        return err.messages
    return None
