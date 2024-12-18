from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import logging
from config import Config
from flask_cors import cross_origin
import re
import base64
import secrets


flashcards_bp = Blueprint('flashcards', __name__)

# Initialize MongoDB
client = MongoClient(Config.MONGODB_URI)
db = client['notes_app']
flashcards_collection = db['flashcards_decks']


from utils.s3_manager import S3Manager
s3_manager = S3Manager(Config)

def is_base64_image(data_url: str) -> bool:
    """
    Check if the provided string is a data URL representing a base64-encoded image.
    Valid formats: data:image/png;base64,xxxx...
    """
    if not data_url.startswith("data:image/"):
        return False
    if ";base64," not in data_url:
        return False
    return True

def upload_card_images(cards, user_id):
    """
    Upload card images to S3 if they are base64 strings.
    """
    updated_cards = []
    for card in cards:
        updated_card = card.copy()
        if 'image' in updated_card and updated_card['image']:
            try:
                # Check if it's already an S3 URL
                if updated_card['image'].startswith('https://'):
                    updated_cards.append(updated_card)
                    continue

                # Generate a unique filename
                filename = f"flashcard_{datetime.utcnow().timestamp()}_{secrets.token_hex(8)}.jpg"
                
                try:
                    # Upload to S3 and get URL
                    s3_url = s3_manager.upload_base64(
                        updated_card['image'],
                        user_id,
                        filename
                    )
                    updated_card['image'] = s3_url
                except Exception as e:
                    logging.error(f"Failed to upload image to S3: {e}")
                    updated_card['image'] = None
            except Exception as e:
                logging.error(f"Error processing card image: {e}")
                updated_card['image'] = None
        updated_cards.append(updated_card)
    return updated_cards


@flashcards_bp.route('/decks', methods=['POST'])
@jwt_required()
@cross_origin()
def create_deck():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        required_fields = ['title', 'description']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields: title, description"}), 400

        cards = data.get("cards", [])
        # Upload images for cards if needed
        cards = upload_card_images(cards, user_id)

        new_deck = {
            "user_id": user_id,
            "title": data["title"].strip(),
            "description": data["description"].strip(),
            "underglowColor": data.get("underglowColor", ""),
            "cards": cards,
            "progress": {
                "learned": [],
                "mastered": [],
                "unfamiliar": list(range(len(cards)))
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = flashcards_collection.insert_one(new_deck)
        new_deck["_id"] = str(result.inserted_id)

        return jsonify(new_deck), 201
    except Exception as e:
        logging.error(f"Error creating deck: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@flashcards_bp.route('/decks', methods=['GET'])
@jwt_required()
@cross_origin()
def list_decks():
    try:
        user_id = get_jwt_identity()
        decks_cursor = flashcards_collection.find({"user_id": user_id})
        decks = []
        for deck in decks_cursor:
            deck["_id"] = str(deck["_id"])
            decks.append(deck)
        return jsonify({"decks": decks}), 200
    except Exception as e:
        logging.error(f"Error listing decks: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@flashcards_bp.route('/decks/<deck_id>', methods=['GET'])
@jwt_required()
@cross_origin()
def get_deck(deck_id):
    try:
        user_id = get_jwt_identity()
        deck = flashcards_collection.find_one({"_id": ObjectId(deck_id), "user_id": user_id})
        if not deck:
            return jsonify({"error": "Deck not found"}), 404

        deck["_id"] = str(deck["_id"])
        return jsonify(deck), 200
    except Exception as e:
        logging.error(f"Error fetching deck: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@flashcards_bp.route('/decks/<deck_id>', methods=['PUT'])
@jwt_required()
@cross_origin()
def update_deck(deck_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if request.content_length and request.content_length > 10 * 1024 * 1024:
            return jsonify({"error": "Request too large"}), 413

        deck = flashcards_collection.find_one({"_id": ObjectId(deck_id), "user_id": user_id})
        if not deck:
            return jsonify({"error": "Deck not found"}), 404

        update_fields = {}
        if "title" in data:
            update_fields["title"] = data["title"].strip()
        if "description" in data:
            update_fields["description"] = data["description"].strip()
        if "underglowColor" in data:
            update_fields["underglowColor"] = data["underglowColor"]
        if "cards" in data:
            updated_cards = upload_card_images(data["cards"], user_id)
            update_fields["cards"] = updated_cards
            # Initialize progress for new cards
            update_fields["progress"] = {
                "learned": [],
                "mastered": [],
                "unfamiliar": list(range(len(updated_cards)))
            }

        update_fields["updated_at"] = datetime.utcnow()

        with client.start_session() as session:
            with session.start_transaction():
                flashcards_collection.update_one(
                    {"_id": ObjectId(deck_id)},
                    {"$set": update_fields},
                    session=session
                )

        updated_deck = flashcards_collection.find_one({"_id": ObjectId(deck_id)})
        updated_deck["_id"] = str(updated_deck["_id"])
        return jsonify(updated_deck), 200

    except Exception as e:
        logging.error(f"Error updating deck: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500
    
@flashcards_bp.route('/decks/<deck_id>/progress', methods=['PUT'])
@jwt_required()
@cross_origin()
def update_deck_progress(deck_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate progress data
        if not isinstance(data.get('progress'), dict):
            return jsonify({"error": "Invalid progress format"}), 400
            
        # Update only progress field
        result = flashcards_collection.update_one(
            {"_id": ObjectId(deck_id), "user_id": user_id},
            {"$set": {
                "progress": {
                    "learned": data['progress'].get('learned', []),
                    "mastered": data['progress'].get('mastered', []),
                    "unfamiliar": data['progress'].get('unfamiliar', [])
                },
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Deck not found"}), 404
            
        return jsonify({"message": "Progress updated successfully"}), 200
        
    except Exception as e:
        logging.error(f"Error updating deck progress: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@flashcards_bp.route('/decks/<deck_id>', methods=['DELETE'])
@jwt_required()
@cross_origin()
def delete_deck(deck_id):
    try:
        user_id = get_jwt_identity()
        deck = flashcards_collection.find_one({"_id": ObjectId(deck_id), "user_id": user_id})
        if not deck:
            return jsonify({"error": "Deck not found"}), 404

        # delete images from S3 , iterate over deck['cards'] and remove them.


        flashcards_collection.delete_one({"_id": ObjectId(deck_id)})
        return jsonify({"message": "Deck deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting deck: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
