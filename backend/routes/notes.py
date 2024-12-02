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
def upload_note():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        user_id = get_jwt_identity()
        subject_id = request.form.get('subject_id')  # Get subject_id from form data
        
        if not file.filename or '.' not in file.filename:
            return jsonify({'error': 'Invalid filename'}), 400

        if file.filename.rsplit('.', 1)[1].lower() not in Config.ALLOWED_EXTENSIONS:
            return jsonify({'error': 'File type not allowed'}), 400

        if not subject_id:
            return jsonify({'error': 'Subject ID is required'}), 400

        # Check if the subject exists for the user
        subject = subjects_collection.find_one({'_id': ObjectId(subject_id), 'user_id': user_id})
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404

        s3_url = s3_manager.upload_file(file, user_id)
        note = Note(user_id, file.filename, s3_url, subject_id=subject_id)
        notes_collection.insert_one(note.__dict__)

        return jsonify({
            'message': 'File uploaded successfully',
            'note_id': str(note._id),
            's3_url': s3_url
        }), 201
    except Exception as e:
        logging.error(f"Upload error: {e}")
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

        # Get the S3 key from the note URL
        image_url = note['s3_url']
        s3_key = image_url.split(f"https://{Config.S3_BUCKET}.s3.amazonaws.com/")[1]

        # Step 1: Generate a pre-signed URL for the image
        presigned_url = s3_manager.generate_presigned_url(s3_key)
        if not presigned_url:
            return jsonify({'error': 'Unable to generate pre-signed URL'}), 500

        # Step 2: Extract text from image using OCR capabilities
        extracted_text = gpt_manager.extract_text_from_image(presigned_url)

        # Step 3: Generate notes based on the extracted text
        generated_notes = gpt_manager.generate_notes(extracted_text)

        # Store generated notes in the database
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
        logging.error(f"Generation error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@notes_bp.route('/add_to_subject', methods=['POST'])
@jwt_required()
def add_note_to_subject():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        note_id = ObjectId(data.get('note_id'))
        subject_id = ObjectId(data.get('subject_id'))

        # Check if note and subject exist
        note = notes_collection.find_one({'_id': note_id, 'user_id': user_id})
        subject = db['subjects'].find_one({'_id': subject_id, 'user_id': user_id})

        if not note or not subject:
            return jsonify({'error': 'Note or Subject not found'}), 404

        # Update note to link with subject
        notes_collection.update_one({'_id': note_id}, {'$set': {'subject_id': subject_id}})
        
        return jsonify({'message': 'Note linked to subject successfully'}), 200
    except Exception as e:
        logging.error(f"Add note to subject error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@notes_bp.route('/subject_notes/<subject_id>', methods=['GET'])
@jwt_required()
def list_subject_notes(subject_id):
    try:
        user_id = get_jwt_identity()
        notes = list(notes_collection.find({'user_id': user_id, 'subject_id': ObjectId(subject_id)}))

        return jsonify({'notes': notes}), 200
    except Exception as e:
        logging.error(f"List subject notes error: {e}")
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

        # Remove the note from S3 if needed
        s3_manager.delete_file(note['s3_url'])

        # Remove the note and related generated notes from the database
        notes_collection.delete_one({'_id': ObjectId(note_id)})
        generated_notes_collection.delete_many({'original_note_id': ObjectId(note_id)})

        return jsonify({'message': 'Note deleted successfully'}), 200
    except Exception as e:
        logging.error(f"Delete note error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@notes_bp.route('/list', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
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
        logging.error(f"List notes error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    

@notes_bp.route('/extract_text', methods=['POST'])
@jwt_required()
def extract_text():
    try:
        data = request.get_json()
        note_id = ObjectId(data.get('note_id'))
        user_id = get_jwt_identity()

        note = notes_collection.find_one({'_id': note_id, 'user_id': user_id})
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        # Get image from S3
        image_data = s3_manager.get_file(note['s3_url'])
        extracted_text = gpt_manager.extract_text_from_image(image_data)

        return jsonify({
            'message': 'Text extracted successfully',
            'extracted_text': extracted_text
        }), 200

    except Exception as e:
        logging.error(f"OCR extraction error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
