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
        # Retrieve form data
        title = request.form.get('title')
        description = request.form.get('description')
        subject_id = request.form.get('subject_id')

        if not title or not description:
            return jsonify({'error': 'Title and Description are required'}), 400

        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        user_id = get_jwt_identity()

        extension = file.filename.rsplit('.', 1)[1].lower()
        if extension not in Config.ALLOWED_EXTENSIONS:
            return jsonify({'error': f'File type not allowed.'}), 400

        if not subject_id:
            return jsonify({'error': 'Subject ID is required'}), 400

        subject = subjects_collection.find_one({'_id': ObjectId(subject_id), 'user_id': user_id})
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404

        # Upload file to S3 (for OCR)
        s3_url = s3_manager.upload_file(file, user_id)
        content_type = file.content_type or 'image/jpeg'

        # Check for cover_image
        cover_image_url = None
        if 'cover_image' in request.files:
            cover_image = request.files['cover_image']
            cover_image_extension = cover_image.filename.rsplit('.', 1)[1].lower()
            if cover_image_extension not in Config.ALLOWED_EXTENSIONS:
                return jsonify({'error': f'Cover image file type not allowed.'}), 400
            cover_image_url = s3_manager.upload_file(cover_image, user_id)
        else:
            # Optionally set a default placeholder image
            cover_image_url = "https://cdn1.vectorstock.com/i/1000x1000/39/90/write-note-school-activity-cartoon-graphic-design-vector-21513990.jpg"

        note = {
            'user_id': user_id,
            'title': title.strip(),
            'description': description.strip(),
            'filename': file.filename,
            's3_url': s3_url,
            'subject_id': subject_id,
            'content_type': content_type,
            'created_at': datetime.utcnow(),
            'status': 'pending',
            'cover_image_url': cover_image_url  # store cover image url
        }

        result = notes_collection.insert_one(note)

        return jsonify({
            'message': 'File uploaded successfully',
            'note_id': str(result.inserted_id),
            's3_url': s3_url,
            'cover_image_url': cover_image_url
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
@jwt_required()
def delete_note(note_id):
    try:
        user_id = get_jwt_identity()
        note = notes_collection.find_one({'_id': ObjectId(note_id), 'user_id': user_id})

        if not note:
            return jsonify({'error': 'Note not found'}), 404

        # Attempt to delete from S3 if s3_url exists and matches expected domain
        s3_url = note.get('s3_url')
        if s3_url and s3_url.startswith(f"https://{Config.S3_BUCKET}.s3.amazonaws.com/"):
            s3_key = s3_url[len(f"https://{Config.S3_BUCKET}.s3.amazonaws.com/"):]
            s3_manager.delete_file(s3_key)
        else:
            # Optional: Log a warning if the s3_url isn't in the expected format
            logging.warning(f"No valid s3_url found for note_id={note_id} or URL doesn't match bucket domain. Skipping S3 deletion.")

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

            # If there's a subject_id, get the subject name
            if 'subject_id' in note and note['subject_id']:
                subject = subjects_collection.find_one({'_id': ObjectId(note['subject_id'])})
                if subject:
                    note['subject_name'] = subject['subject_name']

            # Extract the S3 key from the stored s3_url
            # Example s3_url: https://<bucket>.s3.amazonaws.com/users/<user_id>/<filename>
            base_url = f"https://{Config.S3_BUCKET}.s3.amazonaws.com/"
            image_url = note.get('s3_url')

            if image_url and image_url.startswith(base_url):
                s3_key = image_url[len(base_url):]
                # Generate a presigned URL
                presigned_url = s3_manager.generate_presigned_url(s3_key, expiration=3600)
                note['image_url'] = presigned_url
            else:
                note['image_url'] = None

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


@notes_bp.route('/get/<notebook_id>', methods=['GET'])
@jwt_required()
@cross_origin()
def get_notebook(notebook_id):
    try:
        user_id = get_jwt_identity()
        note = notes_collection.find_one({'_id': ObjectId(notebook_id), 'user_id': user_id})

        if not note:
            return jsonify({'error': 'Notebook not found.'}), 404

        note['_id'] = str(note['_id'])
        if 'subject_id' in note and note['subject_id']:
            subject = subjects_collection.find_one({'_id': ObjectId(note['subject_id'])})
            if subject:
                note['subject_name'] = subject['subject_name']
        # Fetch generated notes
        gen_note = generated_notes_collection.find_one({'original_note_id': ObjectId(notebook_id)})
        if gen_note:
            note['generated_content'] = gen_note['content']
        if 'cover_image_url' in note and note['cover_image_url']:
            note['image_url'] = note['cover_image_url']
        else:
            note['image_url'] = None  # or a default image URL

        return jsonify({'note': note}), 200
    except Exception as e:
        logging.error(f"Get notebook error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@notes_bp.route('/update/<notebook_id>', methods=['PUT'])
@jwt_required()
@cross_origin()
def update_notebook(notebook_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        update_fields = {}
        if 'title' in data:
            update_fields['title'] = data['title'].strip()
        if 'description' in data:
            update_fields['description'] = data['description'].strip()
        if 'category' in data:
            update_fields['subject_id'] = str(data['subject_id'])  # Assuming category maps to subject_id

        if 'image' in data:
            # Handle image update logic, possibly re-uploading to S3
            pass  # Implement as needed

        if not update_fields:
            return jsonify({'error': 'No fields to update.'}), 400

        result = notes_collection.update_one(
            {'_id': ObjectId(notebook_id), 'user_id': user_id},
            {'$set': update_fields}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Notebook not found or no changes made.'}), 404

        return jsonify({'message': 'Notebook updated successfully.'}), 200

    except Exception as e:
        logging.error(f"Update notebook error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500




@notes_bp.route('/update_generated_notes/<notebook_id>', methods=['PUT'])
@jwt_required()
@cross_origin()
def update_generated_notes(notebook_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        new_content = data.get('generated_content')
        if not new_content:
            return jsonify({'error': 'No generated_content provided.'}), 400

        gen_note = generated_notes_collection.find_one({'original_note_id': ObjectId(notebook_id), 'user_id': user_id})
        if not gen_note:
            return jsonify({'error': 'Generated notes not found.'}), 404

        generated_notes_collection.update_one(
            {'_id': gen_note['_id']},
            {'$set': {'content': new_content}}
        )

        return jsonify({'message': 'Generated notes updated successfully'}), 200

    except Exception as e:
        logging.error(f"Update generated notes error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500
