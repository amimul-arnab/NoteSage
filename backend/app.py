from flask import Flask
from flask_jwt_extended import JWTManager
import logging
from config import Config
from flask_cors import CORS


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Configure CORS more explicitly
    app.config['CORS_HEADERS'] = 'Content-Type'
    CORS(app, resources={
        r"/auth/*": {
            "origins": ["http://127.0.0.1:5500", "http://localhost:5500"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        },
        r"/notes/*": {  # Add this if you need access to notes endpoints
            "origins": ["http://127.0.0.1:5500", "http://localhost:5500"],
            "methods": ["GET", "POST", "OPTIONS", "DELTE"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        },
        r"/subjects/*": {
            "origins": ["http://127.0.0.1:5500", "http://localhost:5500"],
            "methods": ["GET", "POST", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        },
        r"/quiz/*": {
            "origins": ["http://127.0.0.1:5500", "http://localhost:5500"],
            "methods": ["POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # Initialize extensions
    jwt = JWTManager(app)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.notes import notes_bp
    from routes.subjects import subjects_bp
    from routes.quiz import quiz_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(notes_bp, url_prefix='/notes')
    app.register_blueprint(subjects_bp, url_prefix='/subjects')
    app.register_blueprint(quiz_bp, url_prefix='/quiz')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
