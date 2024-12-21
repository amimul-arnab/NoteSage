from flask import Flask
from flask_jwt_extended import JWTManager
import logging
from config import Config
from flask_cors import CORS

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Configure CORS
    app.config['CORS_HEADERS'] = 'Content-Type'
    CORS(app, resources={
        r"/auth/*": {
            "origins": ["http://127.0.0.1:3000", "http://localhost:3000"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        },
        r"/notes/*": {
            "origins": ["http://127.0.0.1:3000", "http://localhost:3000"],
            "methods": ["GET", "POST", "OPTIONS", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        },
        r"/flashcards/*": {
            "origins": ["http://127.0.0.1:3000", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        },
        r"/subjects/*": {
            "origins": ["http://127.0.0.1:3000", "http://localhost:3000"],
            "methods": ["GET", "POST", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        },
        r"/quiz/*": {
            "origins": ["http://127.0.0.1:3000", "http://localhost:3000"],
            "methods": ["POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    jwt = JWTManager(app)

    from routes.auth import auth_bp
    from routes.notes import notes_bp
    from routes.subjects import subjects_bp
    from routes.quiz import quiz_bp
    from routes.flashcards import flashcards_bp  

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(notes_bp, url_prefix='/notes')
    app.register_blueprint(subjects_bp, url_prefix='/subjects')
    app.register_blueprint(quiz_bp, url_prefix='/quiz')
    app.register_blueprint(flashcards_bp, url_prefix='/flashcards')  

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
