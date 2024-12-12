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
    Iterate through the provided cards. If a card's image field is a base64 data URL,
    upload it to S3 and replace the image field with the S3 URL.
    """
    updated_cards = []
    for card in cards:
        updated_card = card.copy()
        if 'image' in updated_card and updated_card['image']:
            image_data = updated_card['image']
            if is_base64_image(image_data):
                # Extract base64 portion
                base64_str = image_data.split(';base64,')[-1]
                # Determine a filename from card term or a timestamp
                filename = f"flashcard_{datetime.utcnow().timestamp()}.png"
                s3_url = s3_manager.upload_base64(base64_str, user_id, filename)
                updated_card['image'] = s3_url
            # else: if it's already a URL, we leave it as is.
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

        # Fetch existing deck
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
            # Upload images for cards if they are base64
            updated_cards = upload_card_images(data["cards"], user_id)
            update_fields["cards"] = updated_cards

        update_fields["updated_at"] = datetime.utcnow()

        flashcards_collection.update_one({"_id": ObjectId(deck_id)}, {"$set": update_fields})

        updated_deck = flashcards_collection.find_one({"_id": ObjectId(deck_id)})
        updated_deck["_id"] = str(updated_deck["_id"])
        return jsonify(updated_deck), 200
    except Exception as e:
        logging.error(f"Error updating deck: {e}", exc_info=True)
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
