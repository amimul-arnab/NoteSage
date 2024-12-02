from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from pymongo import MongoClient
from models import User
import logging
from config import Config
from flask_cors import cross_origin
import re

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

# Initialize MongoDB connection
client = MongoClient(Config.MONGODB_URI)
db = client['notes_app']
users_collection = db['users']

# Token blacklist set for logged out tokens
token_blacklist = set()

def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def is_valid_password(password):
    """
    Password must be at least 8 characters long and contain:
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    """
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True

@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
@cross_origin()
def signup():
    try:
        if request.method == 'OPTIONS':
            return jsonify({}), 200
            
        data = request.get_json()
        if not all(k in data for k in ('email', 'password')):
            return jsonify({'error': 'Missing required fields'}), 400

        email = data['email']
        password = data['password']

        # Validate email format
        if not is_valid_email(email):
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate password strength
        if not is_valid_password(password):
            return jsonify({'error': 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'}), 400

        # Check if email already exists
        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'Email already registered'}), 409

        # Hash password and create user
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(email, password_hash)
        users_collection.insert_one(user.__dict__)
        
        # Create tokens
        access_token = create_access_token(identity=email)
        refresh_token = create_refresh_token(identity=email)
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except Exception as e:
        logging.error(f"Signup error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin()
def login():
    try:
        if request.method == 'OPTIONS':
            return jsonify({}), 200

        data = request.get_json()
        if not all(k in data for k in ('email', 'password')):
            return jsonify({'error': 'Missing required fields'}), 400

        user = users_collection.find_one({'email': data['email']})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Access the hashed password from MongoDB
        stored_password_hash = user.get('password_hash')
        if not stored_password_hash:
            return jsonify({'error': 'Password not found in database'}), 500

        # Compare the provided password with the stored hash
        if not bcrypt.check_password_hash(stored_password_hash, data['password']):
            return jsonify({'error': 'Invalid password'}), 401

        access_token = create_access_token(identity=data['email'])
        refresh_token = create_refresh_token(identity=data['email'])

        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    except Exception as e:
        logging.error(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
@cross_origin()
def logout():
    try:
        jti = get_jwt()['jti']
        token_blacklist.add(jti)
        return jsonify({'message': 'Successfully logged out'}), 200
    except Exception as e:
        logging.error(f"Logout error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@cross_origin()
def refresh():
    try:
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        return jsonify({
            'access_token': new_access_token
        }), 200
    except Exception as e:
        logging.error(f"Token refresh error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
@cross_origin()
def get_user_profile():
    try:
        current_user = get_jwt_identity()
        user = users_collection.find_one({'email': current_user}, {'password': 0})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'email': user['email'],
            'created_at': user.get('created_at', None)
        }), 200
    except Exception as e:
        logging.error(f"Profile fetch error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

