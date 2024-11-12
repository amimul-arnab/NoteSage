from flask import Blueprint, redirect, url_for, session, jsonify
from flask_jwt_extended import create_access_token
from .models import create_user, get_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login')
def login():
    return redirect(url_for('google.login'))

@auth_bp.route('/callback')
def callback():
    response = auth_bp.google.authorized_response()
    if response is None or response.get('access_token') is None:
        return 'Access denied'

    session['google_token'] = (response['access_token'], '')
    user_info = auth_bp.google.get('userinfo').data
    user = get_user(auth_bp.db, user_info['id'])

    if not user:
        user = create_user(auth_bp.db, user_info)

    access_token = create_access_token(identity=user['user_id'])
    return jsonify(access_token=access_token)

@auth_bp.google.tokengetter
def get_google_oauth_token():
    return session.get('google_token')
