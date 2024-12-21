from flask import Flask, render_template_string, request, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient
import openai
import os
import time
import logging
from config import Config

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log_messages = []  # In-memory log storage for display

# Function to log messages with status
def log_message(status, message):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log = {"timestamp": timestamp, "status": status, "message": message}
    log_messages.append(log)
    logging.info(message)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    connection_status = {"MongoDB": False, "OpenAI": False}

    # Environment Variable Check
    required_env_keys = ["MONGODB_URI", "OPEN_AI_KEY", "AWS_ACCESS_KEY", "AWS_SECRET_KEY"]
    for key in required_env_keys:
        value = os.getenv(key)
        if not value:
            log_message("❌", f"Environment variable {key} is not set!")
        else:
            log_message("✅", f"Environment variable {key} loaded successfully.")

    # MongoDB Connection Test
    try:
        client = MongoClient(os.getenv("MONGODB_URI"))
        client.server_info()
        connection_status["MongoDB"] = True
        log_message("✅", "Successfully connected to MongoDB.")
    except Exception as e:
        log_message("❌", f"Unable to connect to MongoDB: {e}")

    # OpenAI Connection Test
    try:
        openai.api_key = os.getenv("OPEN_AI_KEY")
        openai.Model.list()
        connection_status["OpenAI"] = True
        log_message("✅", "Successfully connected to OpenAI API.")
    except Exception as e:
        log_message("❌", f"Unable to connect to OpenAI API: {e}")

    # Middleware for Real-Time API Logging
    @app.before_request
    def log_request():
        log_message("🔵", f"API Request: {request.method} {request.path}")

    # HTML Template with Terminal-Style Logs
    status_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Backend Service Status</title>
        <style>
            body { font-family: Consolas, monospace; background-color: #1e1e2e; color: #cdd6f4; margin: 0; padding: 0; }
            h1 { text-align: center; color: #89b4fa; margin-top: 20px; }
            .container { max-width: 900px; margin: auto; padding: 20px; background: #313244; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.3); }
            .status { padding: 10px; margin: 5px 0; display: flex; justify-content: space-between; }
            .terminal { background: #000; color: #00ff00; padding: 15px; border-radius: 5px; height: 300px; overflow-y: auto; white-space: pre-wrap; }
            .success { color: #a6e3a1; }
            .error { color: #f38ba8; }
            .info { color: #fab387; }
        </style>
        <script>
            // Periodically fetch logs to simulate real-time updates
            async function fetchLogs() {
                const response = await fetch('/logs');
                const logs = await response.json();
                const terminal = document.getElementById('terminal');
                terminal.innerHTML = logs.map(log => `[${log.timestamp}] ${log.status} - ${log.message}`).join('\\n');
                terminal.scrollTop = terminal.scrollHeight;
            }

            setInterval(fetchLogs, 2000);  // Fetch logs every 2 seconds
            window.onload = fetchLogs;    // Fetch logs on page load
        </script>
    </head>
    <body>
        <h1>Backend Status: {% if connection_status.MongoDB and connection_status.OpenAI %}Connected 🚀{% else %}Error Establishing Connection ❌{% endif %}</h1>
        <div class="container">
            <h2>Environment Variables</h2>
            {% for log in logs %}
                <div class="status {% if log.status == '✅' %}success{% elif log.status == '❌' %}error{% else %}info{% endif %}">
                    {{ log.message }} <span>{{ log.status }}</span>
                </div>
            {% endfor %}

            <h2>Service Connections</h2>
            <div class="status success">
                MongoDB Connection: {% if connection_status.MongoDB %}Connected ✅{% else %}No Connection ❌{% endif %}
            </div>
            <div class="status success">
                OpenAI Connection: {% if connection_status.OpenAI %}Connected ✅{% else %}No Connection ❌{% endif %}
            </div>

            <h2>API Activity & Logs</h2>
            <div class="terminal" id="terminal"></div>
        </div>
    </body>
    </html>
    """

    # Route to display connection statuses
    @app.route('/')
    def home():
        return render_template_string(status_html, logs=log_messages, connection_status=connection_status)

    # Route to serve logs in JSON for real-time updates
    @app.route('/logs')
    def get_logs():
        return jsonify(log_messages)

    # Configure CORS
    app.config['CORS_HEADERS'] = 'Content-Type'
    CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})

    jwt = JWTManager(app)

    # Register Blueprints
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
    logging.info("Starting Flask server...")
    app.run(debug=True)