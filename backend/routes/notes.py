from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from models import Note
from utils.s3_manager import S3Manager
from utils.gpt_api import GPTManager
import logging
from config import Config

notes_bp = Blueprint('notes', __name__)

# Initialize MongoDB connection
client = MongoClient(Config.MONGODB_URI)
db = client['notes_app']
notes_collection = db['notes']
generated_notes_collection = db['generated_notes']
subjects_collection = db['subjects']

# Initialize S3 and GPT managers
s3_manager = S3Manager(Config)
gpt_manager = GPTManager()

@notes_bp.route('/upload', methods=['POST'])
@jwt_required()
@cross_origin()
def upload_note():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        user_id = get_jwt_identity()
        subject_id = request.form.get('subject_id')

        if not file.filename or '.' not in file.filename:
            return jsonify({'error': 'Invalid filename'}), 400

        extension = file.filename.rsplit('.', 1)[1].lower()
        if extension not in Config.ALLOWED_EXTENSIONS:
            return jsonify({'error': f'File type not allowed. Allowed: {Config.ALLOWED_EXTENSIONS}'}), 400

        if not subject_id:
            return jsonify({'error': 'Subject ID is required'}), 400

        subject = subjects_collection.find_one({'_id': ObjectId(subject_id), 'user_id': user_id})
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404

        s3_url = s3_manager.upload_file(file, user_id)
        content_type = file.content_type or 'image/jpeg'  # fallback if needed

        note = Note(user_id, file.filename, s3_url, subject_id=subject_id)
        note.content_type = content_type  # Store the content type in the note object
        # Insert note with content_type
        note_dict = note.__dict__
        note_dict['content_type'] = content_type
        notes_collection.insert_one(note_dict)

        return jsonify({
            'message': 'File uploaded successfully',
            'note_id': str(note._id),
            's3_url': s3_url
        }), 201
    except Exception as e:
        logging.error(f"Upload error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

    
@notes_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_notes():
    try:
        data = request.get_json()
        note_id = ObjectId(data.get('note_id'))
        user_id = get_jwt_identity()

        # Fetch the note
        note = notes_collection.find_one({'_id': note_id, 'user_id': user_id})
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        image_url = note['s3_url']
        # Extract key from image_url
        # Assuming s3_url is like: https://<bucket>.s3.amazonaws.com/users/<user_id>/<filename>
        # Bucket is config.S3_BUCKET
        base_url = f"https://{Config.S3_BUCKET}.s3.amazonaws.com/"
        if not image_url.startswith(base_url):
            return jsonify({'error': 'Invalid S3 URL'}), 400

        s3_key = image_url[len(base_url):]

        # Extract text from image using Amazon Textract
        extracted_text_result = gpt_manager.extract_text_from_image(Config.S3_BUCKET, s3_key)
        extracted_text = extracted_text_result['text']

        # Generate notes from extracted text
        generated_notes = gpt_manager.generate_notes(extracted_text)

        # Store generated notes
        generated_notes_collection.insert_one({
            'user_id': user_id,
            'original_note_id': note_id,
            'content': generated_notes['summary'],
            'created_at': datetime.utcnow()
        })

        return jsonify({
            'message': 'Notes generated successfully',
            'summary': generated_notes['summary']
        }), 200

    except Exception as e:
        logging.error(f"Generation error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500



@notes_bp.route('/add_to_subject', methods=['POST'])
@jwt_required()
@cross_origin()
def add_note_to_subject():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        note_id = ObjectId(data.get('note_id'))
        subject_id = ObjectId(data.get('subject_id'))

        note = notes_collection.find_one({'_id': note_id, 'user_id': user_id})
        subject = subjects_collection.find_one({'_id': subject_id, 'user_id': user_id})

        if not note or not subject:
            return jsonify({'error': 'Note or Subject not found'}), 404

        notes_collection.update_one({'_id': note_id}, {'$set': {'subject_id': subject_id}})
        
        return jsonify({'message': 'Note linked to subject successfully'}), 200
    except Exception as e:
        logging.error(f"Add note to subject error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500



@notes_bp.route('/subject_notes/<subject_id>', methods=['GET'])
@jwt_required()
@cross_origin()
def list_subject_notes(subject_id):
    try:
        user_id = get_jwt_identity()
        notes = list(notes_collection.find({'user_id': user_id, 'subject_id': ObjectId(subject_id)}))

        for n in notes:
            n['_id'] = str(n['_id'])
            # Query the generated_notes_collection using original_note_id = n['_id']
            gen_note = generated_notes_collection.find_one({'original_note_id': ObjectId(n['_id'])})
            if gen_note and 'content' in gen_note:
                n['generated_content'] = gen_note['content']
        
        return jsonify({'notes': notes}), 200
    except Exception as e:
        logging.error(f"List subject notes error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


# @notes_bp.route('/subject_notes/<subject_id>', methods=['GET'])
# @jwt_required()
# @cross_origin()
# def list_subject_notes(subject_id):
#     try:
#         user_id = get_jwt_identity()
#         notes = list(notes_collection.find({'user_id': user_id, 'subject_id': ObjectId(subject_id)}))

#         for n in notes:
#             n['_id'] = str(n['_id'])
#             # Fetch the corresponding generated notes if available
#             gen_note = generated_notes_collection.find_one({'original_note_id': ObjectId(n['_id'])})
#             if gen_note:
#                 n['generated_content'] = gen_note['content']  # Attach generated HTML content to the note object

#         return jsonify({'notes': notes}), 200
#     except Exception as e:
#         logging.error(f"List subject notes error: {e}", exc_info=True)
#         return jsonify({'error': 'Internal server error'}), 500


@notes_bp.route('/generated_notes/<subject_id>', methods=['GET'])
@jwt_required()
@cross_origin()
def list_generated_notes(subject_id):
    try:
        user_id = get_jwt_identity()
        generated = list(generated_notes_collection.find({'user_id': user_id, 'subject_id': ObjectId(subject_id)}))
        for g in generated:
            g['_id'] = str(g['_id'])
            g['original_note_id'] = str(g['original_note_id'])
        return jsonify({'generated_notes': generated}), 200
    except Exception as e:
        logging.error(f"List generated notes error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@notes_bp.route('/delete/<note_id>', methods=['DELETE'])
@cross_origin(origins=["http://127.0.0.1:5500", "http://localhost:5500"], methods=["DELETE", "OPTIONS"], allow_headers=["Content-Type", "Authorization"], supports_credentials=True)
@jwt_required()
def delete_note(note_id):
    try:
        user_id = get_jwt_identity()
        note = notes_collection.find_one({'_id': ObjectId(note_id), 'user_id': user_id})

        if not note:
            return jsonify({'error': 'Note not found'}), 404

        # Extract the S3 key from URL
        image_url = note['s3_url']
        s3_key = image_url.split(f"https://{Config.S3_BUCKET}.s3.amazonaws.com/")[1]

        # Delete from S3
        s3_manager.delete_file(s3_key)

        # Delete from DB
        notes_collection.delete_one({'_id': ObjectId(note_id)})
        generated_notes_collection.delete_many({'original_note_id': ObjectId(note_id)})

        return jsonify({'message': 'Note deleted successfully'}), 200
    except Exception as e:
        logging.error(f"Delete note error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@notes_bp.route('/list', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
@cross_origin()
def list_notes():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        user_id = get_jwt_identity()

        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        notes = list(notes_collection.find({'user_id': user_id}))
        for note in notes:
            note['_id'] = str(note['_id'])
            if 'subject_id' in note and note['subject_id']:
                subject = subjects_collection.find_one({'_id': ObjectId(note['subject_id'])})
                if subject:
                    note['subject_name'] = subject['subject_name']

        return jsonify({'notes': notes}), 200
    except Exception as e:
        logging.error(f"List notes error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@notes_bp.route('/extract_text', methods=['POST'])
@jwt_required()
@cross_origin()
def extract_text():
    try:
        data = request.get_json()
        note_id = ObjectId(data.get('note_id'))
        user_id = get_jwt_identity()

        note = notes_collection.find_one({'_id': note_id, 'user_id': user_id})
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        image_url = note['s3_url']
        s3_key = image_url.split(f"https://{Config.S3_BUCKET}.s3.amazonaws.com/")[1]
        image_data = s3_manager.get_file(s3_key)
        content_type = note.get('content_type', 'image/jpeg')

        extracted_text_result = gpt_manager.extract_text_from_image(image_data, content_type)

        return jsonify({
            'message': 'Text extracted successfully',
            'extracted_text': extracted_text_result['text']
        }), 200

    except Exception as e:
        logging.error(f"OCR extraction error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500
