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
from utils.s3_manager import S3Manager
from utils.gpt_api import gpt_manager  

flashcards_bp = Blueprint('flashcards', __name__)

# Initialize MongoDB
client = MongoClient(Config.MONGODB_URI)
db = client['notes_app']
flashcards_collection = db['flashcards_decks']
notes_collection = db['notes']
generated_notes_collection = db['generated_notes']

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
    upload it to S3 and replace the image field with the S3 URL. If it's already a URL,
    leave it as is.
    """
    updated_cards = []
    for card in cards:
        updated_card = card.copy()
        if 'image' in updated_card and updated_card['image']:
            try:
                # Check if it's already an S3 URL or any HTTPS URL
                if updated_card['image'].startswith('https://'):
                    updated_cards.append(updated_card)
                    continue

                # Check if it's a base64-encoded image
                if is_base64_image(updated_card['image']):
                    # Extract base64 portion
                    base64_str = updated_card['image'].split(';base64,')[-1]
                    # Generate a unique filename
                    filename = f"flashcard_{datetime.utcnow().timestamp()}_{secrets.token_hex(8)}.png"
                    # Upload to S3
                    s3_url = s3_manager.upload_base64(base64_str, user_id, filename)
                    updated_card['image'] = s3_url
                else:
                    # If it's not a base64 image and not a URL, set image to None or handle accordingly
                    updated_card['image'] = None
            except Exception as e:
                logging.error(f"Failed to process image for card: {e}", exc_info=True)
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
    

@flashcards_bp.route('/decks/<deck_id>/progress', methods=['PUT'])
@jwt_required()
@cross_origin()
def update_deck_progress(deck_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not isinstance(data.get('progress'), dict):
            logging.error("Invalid progress format received.")
            return jsonify({"error": "Invalid progress format"}), 400

        # Fetch the current deck
        deck = flashcards_collection.find_one({"_id": ObjectId(deck_id), "user_id": user_id})
        if not deck:
            logging.error(f"Deck with ID {deck_id} not found.")
            return jsonify({"error": "Deck not found"}), 404

        logging.info(f"Updating progress for Deck ID: {deck_id}")

        updated_cards = []
        for card_index, card in enumerate(deck['cards']):
            # Update status
            if card_index in data['progress'].get('mastered', []):
                card['status'] = 'mastered'
            elif card_index in data['progress'].get('learned', []):
                card['status'] = 'learned'
            else:
                card['status'] = 'unfamiliar'

            # Update streak and last reviewed if provided
            if 'cardStates' in data and str(card_index) in data['cardStates']:
                card_state = data['cardStates'][str(card_index)]
                card['streak'] = card_state.get('streak', 0)
                card['last_reviewed'] = datetime.utcnow()

            updated_cards.append(card)

        # Update progress
        progress = {
            "learned": data['progress'].get('learned', []),
            "mastered": data['progress'].get('mastered', []),
            "unfamiliar": data['progress'].get('unfamiliar', []),
        }

        flashcards_collection.update_one(
            {"_id": ObjectId(deck_id), "user_id": user_id},
            {"$set": {
                "cards": updated_cards,
                "progress": progress,
                "updated_at": datetime.utcnow()
            }}
        )

        # Return counts for frontend
        progress_counts = {
            "learned_count": len(progress["learned"]),
            "mastered_count": len(progress["mastered"]),
            "unfamiliar_count": len(progress["unfamiliar"]),
        }

        logging.info(f"Progress updated successfully for Deck ID: {deck_id}")
        return jsonify({"message": "Progress updated successfully", "progress_counts": progress_counts}), 200

    except Exception as e:
        logging.error(f"Error updating deck progress: {e}", exc_info=True)
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
                    {"_id": ObjectId(deck_id), "user_id": user_id},
                    {"$set": update_fields},
                    session=session
                )

        updated_deck = flashcards_collection.find_one({"_id": ObjectId(deck_id), "user_id": user_id})
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

        # Delete images from S3
        for card in deck.get('cards', []):
            image_url = card.get('image')
            if image_url and image_url.startswith('https://'):
                try:
                    # Extract the filename from the URL
                    filename = image_url.split('/')[-1]
                    s3_manager.delete_file(user_id, filename)
                except Exception as e:
                    logging.error(f"Failed to delete image {image_url} from S3: {e}", exc_info=True)

        flashcards_collection.delete_one({"_id": ObjectId(deck_id), "user_id": user_id})
        return jsonify({"message": "Deck deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting deck: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@flashcards_bp.route('/generate_from_note', methods=['POST'])
@jwt_required()
@cross_origin()
def generate_deck_from_note():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        note_id = data.get('note_id')

        if not note_id:
            return jsonify({'error': 'Missing note_id'}), 400

        # Fetch the original note to get its title
        original_note = notes_collection.find_one({'_id': ObjectId(note_id), 'user_id': user_id})
        if not original_note:
            return jsonify({'error': 'Note not found'}), 404

        note_title = original_note.get('title', 'Untitled Note')

        # Find the generated note content for the given note_id
        gen_note = generated_notes_collection.find_one({'original_note_id': ObjectId(note_id), 'user_id': user_id})
        if not gen_note:
            return jsonify({'error': 'Generated notes not found for this note'}), 404

        # Extract the generated content (HTML)
        content = gen_note['content']

        # Remove HTML tags to get plain text for GPT
        cleaned_content = re.sub('<[^<]+?>', '', content)

        # Use GPT to generate flashcards from the cleaned text
        flashcards = gpt_manager.generate_flashcards(cleaned_content)
        if not flashcards or not isinstance(flashcards, list):
            return jsonify({'error': 'Failed to generate flashcards'}), 500

        # Upload images in flashcards if any (assuming flashcards have 'image' field)
        flashcards = upload_card_images(flashcards, user_id)

        # Create a new deck using the note's title
        new_deck = {
            "user_id": user_id,
            "title": note_title,
            "description": f"Flashcards generated from {note_title}",
            "underglowColor": "",
            "cards": flashcards,
            "progress": {
                "learned": [],
                "mastered": [],
                "unfamiliar": list(range(len(flashcards)))
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = flashcards_collection.insert_one(new_deck)
        new_deck["_id"] = str(result.inserted_id)

        return jsonify({
            'message': 'Flashcards generated successfully',
            'deck': new_deck
        }), 200

    except Exception as e:
        logging.error(f"Generate flashcards from note error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500
