from datetime import datetime
from bson import ObjectId

class User:
    def __init__(self, email, password_hash, full_name=None):
        self.email = email
        self.password_hash = password_hash
        self.full_name = full_name
        self.created_at = datetime.utcnow()

class Note:
    def __init__(self, user_id, filename, s3_url, subject_id=None, content_type=None):
        self.user_id = user_id
        self.filename = filename
        self.s3_url = s3_url
        self.subject_id = subject_id  # Reference to the Subject
        self.created_at = datetime.utcnow()
        self.status = 'pending'
        self.content_type = content_type  # Added field for MIME type of the uploaded file

class GeneratedNote:
    def __init__(self, user_id, original_note_id, content, subject_id=None):
        self.user_id = user_id
        self.original_note_id = original_note_id
        self.subject_id = subject_id  # Direct reference to subject
        self.content = content
        self.created_at = datetime.utcnow()

class Subject:
    def __init__(self, user_id, subject_name):
        self.user_id = user_id
        self.subject_name = subject_name
        self.created_at = datetime.utcnow()

class FlashcardCard:
    def __init__(self, term, definition, image=None):
        self.term = term
        self.definition = definition
        self.image = image
        self.streak = 0
        self.status = 'unfamiliar'  # 'unfamiliar', 'learned', or 'mastered'
        self.last_reviewed = None

class FlashcardDeck:
    def __init__(self, user_id, title, description, underglowColor="", cards=None):
        self.user_id = user_id
        self.title = title
        self.description = description
        self.underglowColor = underglowColor
        self.cards = cards if cards is not None else []
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.progress = {"learned": [],"mastered": [], "unfamiliar": []}

