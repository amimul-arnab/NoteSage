from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
import logging
from config import Config
from utils.gpt_api import GPTManager

quiz_bp = Blueprint('quiz', __name__)

# Initialize MongoDB connection
client = MongoClient(Config.MONGODB_URI)
db = client['notes_app']
subjects_collection = db['subjects']
notes_collection = db['notes']

# Initialize GPT manager
gpt_manager = GPTManager()

@quiz_bp.route('/generate/<subject_id>', methods=['POST'])
@jwt_required()
def generate_flashcards(subject_id):
    try:
        user_id = get_jwt_identity()
        subject = subjects_collection.find_one({'_id': ObjectId(subject_id), 'user_id': user_id})

        if not subject:
            return jsonify({'error': 'Subject not found'}), 404

        notes = list(notes_collection.find({'user_id': user_id, 'subject_id': ObjectId(subject_id)}))

        # Concatenate content from all notes
        content = " ".join([gpt_manager.get_text_from_s3(note['s3_url']) for note in notes])
        flashcards = gpt_manager.generate_flashcards(content)

        return jsonify({'flashcards': flashcards}), 200
    except Exception as e:
        logging.error(f"Generate flashcards error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
