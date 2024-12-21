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

@flashcards_bp.route('/decks/<deck_id>', methods=['GET'])
@jwt_required()
@cross_origin()
def get_deck(deck_id):
    try:
        user_id = get_jwt_identity()
        deck = flashcards_collection.find_one({"_id": ObjectId(deck_id), "user_id": user_id})
        if not deck:
            return jsonify({"error": "Deck not found"}), 404

        # Ensure progress structure exists
        if 'progress' not in deck:
            deck['progress'] = {
                'learned': [],
                'mastered': [],
                'unfamiliar': list(range(len(deck.get('cards', []))))
            }

        # Initialize cardStates if not present
        if 'cardStates' not in deck:
            deck['cardStates'] = {
                str(i): {
                    'streak': 0,
                    'status': 'unfamiliar',
                    'lastAnswered': None
                } for i in range(len(deck.get('cards', [])))
            }

        # Update cards with their current states
        for i, card in enumerate(deck.get('cards', [])):
            card_state = deck['cardStates'].get(str(i), {})
            card['status'] = card_state.get('status', 'unfamiliar')
            card['streak'] = card_state.get('streak', 0)
            card['learned'] = card_state.get('status') == 'learned'
            card['mastered'] = card_state.get('status') == 'mastered'

        # Calculate progress counts for TestUI
        total_cards = len(deck.get('cards', []))
        learned_count = len([c for c in deck.get('cards', []) if c.get('learned') and not c.get('mastered')])
        mastered_count = len([c for c in deck.get('cards', []) if c.get('mastered')])
        unfamiliar_count = total_cards - learned_count - mastered_count

        deck['progress_counts'] = {
            'learned': learned_count,
            'mastered': mastered_count,
            'unfamiliar': unfamiliar_count,
            'total': total_cards
        }

        deck["_id"] = str(deck["_id"])
        return jsonify(deck), 200
    except Exception as e:
        logging.error(f"Error fetching deck: {e}", exc_info=True)
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
            # Calculate progress for each deck
            total_cards = len(deck.get('cards', []))
            if total_cards > 0:
                learned_count = len([c for c in deck.get('cards', []) if c.get('learned') and not c.get('mastered')])
                mastered_count = len([c for c in deck.get('cards', []) if c.get('mastered')])
                unfamiliar_count = total_cards - learned_count - mastered_count

                deck['progress_counts'] = {
                    'learned': learned_count,
                    'mastered': mastered_count,
                    'unfamiliar': unfamiliar_count,
                    'total': total_cards
                }
            else:
                deck['progress_counts'] = {
                    'learned': 0,
                    'mastered': 0,
                    'unfamiliar': 0,
                    'total': 0
                }
            
            deck["_id"] = str(deck["_id"])
            decks.append(deck)
        return jsonify({"decks": decks}), 200
    except Exception as e:
        logging.error(f"Error listing decks: {e}", exc_info=True)
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

        if not isinstance(data.get('progress'), dict):
            logging.error("Invalid progress format received.")
            return jsonify({"error": "Invalid progress format"}), 400

        deck = flashcards_collection.find_one({"_id": ObjectId(deck_id), "user_id": user_id})
        if not deck:
            return jsonify({"error": "Deck not found"}), 404

        # Store both progress and cardStates
        update_data = {
            "progress": data['progress'],
            "cardStates": data.get('cardStates', {}),  # Store the complete cardStates
            "updated_at": datetime.utcnow()
        }

        # Update cards with their states
        updated_cards = []
        for i, card in enumerate(deck['cards']):
            card_state = data.get('cardStates', {}).get(str(i), {})
            updated_card = {
                **card,
                'status': card_state.get('status', 'unfamiliar'),
                'streak': card_state.get('streak', 0),
                'lastAnswered': card_state.get('lastAnswered'),
                'learned': card_state.get('status') in ['learned', 'mastered'],
                'mastered': card_state.get('status') == 'mastered'
            }
            updated_cards.append(updated_card)

        update_data['cards'] = updated_cards

        # Update the deck with all data
        result = flashcards_collection.update_one(
            {"_id": ObjectId(deck_id), "user_id": user_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            return jsonify({"error": "Failed to update progress"}), 500

        # Calculate and return progress counts
        total_cards = len(updated_cards)
        learned_count = len([c for c in updated_cards if c.get('learned') and not c.get('mastered')])
        mastered_count = len([c for c in updated_cards if c.get('mastered')])

        return jsonify({
            "message": "Progress updated successfully",
            "progress_counts": {
                "learned": learned_count,
                "mastered": mastered_count,
                "unfamiliar": total_cards - learned_count - mastered_count,
                "total": total_cards
            }
        }), 200

    except Exception as e:
        logging.error(f"Error updating deck progress: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


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
