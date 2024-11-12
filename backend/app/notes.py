from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from .services import upload_file_to_s3
from .utils import validate_input, NoteSchema

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_note():
    user_id = get_jwt_identity()
    file = request.files.get('file')

    if not file:
        return jsonify(message='No file provided'), 400

    filename = secure_filename(file.filename)
    file_url = upload_file_to_s3(file, filename)

    if not file_url:
        current_app.logger.error('File upload failed')
        return jsonify(message='File upload failed'), 500

    note = {
        'user_id': user_id,
        'file_url': file_url,
        'filename': filename
    }
    current_app.db.notes.insert_one(note)
    return jsonify(message='File uploaded', file_url=file_url), 201
