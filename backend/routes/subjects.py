from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import logging
from config import Config

subjects_bp = Blueprint('subjects', __name__)

# Initialize MongoDB connection
client = MongoClient(Config.MONGODB_URI)
db = client['notes_app']
subjects_collection = db['subjects']
notes_collection = db['notes']

@subjects_bp.route('/create', methods=['POST'])
@jwt_required()
def create_subject():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        subject_name = data.get('subject_name')

        if not subject_name:
            return jsonify({'error': 'Subject name is required'}), 400

        new_subject = {
            'user_id': user_id,
            'subject_name': subject_name,
            'created_at': datetime.utcnow()
        }
        subjects_collection.insert_one(new_subject)

        return jsonify({'message': 'Subject created successfully', 'subject_name': subject_name}), 201
    except Exception as e:
        logging.error(f"Create subject error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@subjects_bp.route('/list', methods=['GET'])
@jwt_required()
def list_subjects():
    try:
        user_id = get_jwt_identity()
        subjects = list(subjects_collection.find({'user_id': user_id}))

        for subject in subjects:
            subject['_id'] = str(subject['_id'])

        return jsonify({'subjects': subjects}), 200
    except Exception as e:
        logging.error(f"List subjects error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@subjects_bp.route('/delete/<subject_id>', methods=['DELETE'])
@jwt_required()
def delete_subject(subject_id):
    try:
        user_id = get_jwt_identity()
        subject = subjects_collection.find_one({'_id': ObjectId(subject_id), 'user_id': user_id})
        
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404
        
        # Delete associated notes
        notes_collection.delete_many({'subject_id': ObjectId(subject_id)})
        
        # Delete the subject itself
        subjects_collection.delete_one({'_id': ObjectId(subject_id)})

        return jsonify({'message': 'Subject deleted successfully'}), 200
    except Exception as e:
        logging.error(f"Delete subject error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
