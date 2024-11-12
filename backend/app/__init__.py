from flask import Flask, jsonify
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
from flask_oauthlib.client import OAuth
import os
import logging

def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID')
    app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET')

    # Database connection
    client = MongoClient(app.config['MONGO_URI'])
    app.db = client.get_database('note_sage_db')

    # JWT setup
    JWTManager(app)

    # OAuth setup
    oauth = OAuth(app)
    google = oauth.remote_app(
        'google',
        consumer_key=app.config['GOOGLE_CLIENT_ID'],
        consumer_secret=app.config['GOOGLE_CLIENT_SECRET'],
        request_token_params={'scope': 'email'},
        base_url='https://www.googleapis.com/oauth2/v1/',
        request_token_url=None,
        access_token_method='POST',
        access_token_url='https://accounts.google.com/o/oauth2/token',
        authorize_url='https://accounts.google.com/o/oauth2/auth',
    )

    app.google = google

    # Logging setup
    logging.basicConfig(level=logging.INFO)
    file_handler = logging.FileHandler('app.log')
    file_handler.setLevel(logging.WARNING)
    app.logger.addHandler(file_handler)

    # Register error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"An error occurred: {e}")
        return jsonify(error=str(e)), 500

    from .routes import register_routes
    register_routes(app)

    return app
