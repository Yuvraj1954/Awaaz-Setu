import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# Database setup
DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def get_response_from_db(service, language, intent):
    """Fetches response from PostgreSQL database for offline-ready data."""
    try:
        with engine.connect() as connection:
            query = text("SELECT response FROM responses WHERE service = :s AND language = :l AND intent = :i")
            result = connection.execute(query, {"s": service, "l": language, "i": intent}).fetchone()
            if result:
                return result[0]
            
            # Fallback to default if intent not found
            query_default = text("SELECT response FROM responses WHERE service = :s AND language = :l AND intent = 'default'")
            result_default = connection.execute(query_default, {"s": service, "l": language}).fetchone()
            return result_default[0] if result_default else None
    except Exception as e:
        print(f"Database error: {e}")
        return None

def detect_intent(text_input, service):
    """
    Analyzes the user's text to find the most relevant intent based on keywords.
    """
    text_input = text_input.lower()

    # Define keyword maps for intent detection
    keywords = {
        'government': {
            'ayushman_bharat': ['ayushman', 'bharat', 'gold card', 'health card', 'आयुष्मान', 'भारत'],
            'ration_card': ['ration', 'card', 'food', 'राशन', 'कार्ड'],
            'pension': ['pension', 'old age', 'बुढ़ापा', 'पेंशन'],
            'housing': ['house', 'housing', 'home', 'awas', 'yojana', 'घर', 'आवास'],
            'birth_certificate': ['birth', 'certificate', 'जन्म', 'प्रमाण'],
            'voter_id': ['voter', 'election', 'id', 'वोटर', 'पहचान पत्र'],
            'aadhar': ['aadhar', 'aadhaar', 'आधार']
        },
        'healthcare': {
            'fever': ['fever', 'temperature', 'bukhar', 'बुखार', 'तापमान'],
            'cough_cold': ['cough', 'cold', 'flu', 'khasi', 'sardi', 'खांसी', 'जुकाम', 'सर्दी'],
            'hospital_guidance': ['hospital', 'doctor', 'clinic', 'checkup', 'अस्पताल', 'डॉक्टर', 'क्लीनिक'],
            'stomach_pain': ['stomach', 'pain', 'belly', 'pet', 'dard', 'पेट', 'दर्द'],
            'vaccination': ['vaccine', 'vaccination', 'injection', 'tika', 'टीका', 'टीकाकरण'],
            'pregnancy': ['pregnant', 'pregnancy', 'baby', 'delivery', 'गर्भवती', 'बच्चा']
        }
    }

    # Search for keywords in the input text
    if service in keywords:
        for intent, words in keywords[service].items():
            for word in words:
                if word in text_input:
                    return intent

    return 'default'

@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/api/query', methods=['POST'])
def process_query():
    try:
        data = request.json
        text_input = data.get('text', '')
        service = data.get('service', 'government')
        language = data.get('language', 'en')

        if not text_input.strip():
            return jsonify({
                'response': 'Please type your question.' if language == 'en' else 'कृपया अपना सवाल लिखें।',
                'success': True
            })

        intent = detect_intent(text_input, service)
        response = get_response_from_db(service, language, intent)

        if not response:
             # Very basic hardcoded fallback if DB fails
             response = "I'm sorry, I couldn't find that information." if language == 'en' else "माफ़ कीजिये, मुझे वह जानकारी नहीं मिली।"

        return jsonify({
            'response': response,
            'success': True,
            'intent': intent
        })
    except Exception as e:
        return jsonify({
            'response': 'Sorry, something went wrong. Please try again.' if language == 'en'
                       else 'क्षमा करें, कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
