from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime
import os
import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)

# Configure secret key
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Configure logging
if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler('logs/cyberhack.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('Cyberhack startup')

# Production configurations
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['JSON_SORT_KEYS'] = False

# Store data in memory (you might want to use a database in production)
data_store = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_data', methods=['POST'])
def add_data():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
        
        data['timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        data_store.append(data)
        app.logger.info(f'Data added successfully: {data}')
        return jsonify({"status": "success", "message": "Data added successfully"})
    except Exception as e:
        app.logger.error(f'Error adding data: {str(e)}')
        return jsonify({"status": "error", "message": "Internal server error"}), 500

@app.route('/get_data', methods=['GET'])
def get_data():
    try:
        return jsonify(data_store)
    except Exception as e:
        app.logger.error(f'Error retrieving data: {str(e)}')
        return jsonify({"status": "error", "message": "Internal server error"}), 500

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"status": "error", "message": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"status": "error", "message": "Internal server error"}), 500

if __name__ == '__main__':
    # In production, this should be run using a WSGI server
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
