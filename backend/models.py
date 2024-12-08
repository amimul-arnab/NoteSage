from datetime import datetime
from bson import ObjectId

class User:
    def __init__(self, email, password_hash, full_name=None):
        self.email = email
        self.password_hash = password_hash
        self.full_name = full_name
        self.created_at = datetime.utcnow()

class Note:
    def __init__(self, user_id, filename, s3_url, subject_id=None):
        self.user_id = user_id
        self.filename = filename
        self.s3_url = s3_url
        self.subject_id = subject_id  # Reference to the Subject
        self.created_at = datetime.utcnow()
        self.status = 'pending'

class GeneratedNote:
    def __init__(self, user_id, original_note_id, content):
        self.user_id = user_id
        self.original_note_id = original_note_id
        self.content = content
        self.created_at = datetime.utcnow()

class Subject:
    def __init__(self, user_id, subject_name):
        self.user_id = user_id
        self.subject_name = subject_name
        self.created_at = datetime.utcnow()
