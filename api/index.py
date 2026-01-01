from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
import random

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# MongoDB Connection
MONGO_URI = os.environ.get("MONGO_URI")
if not MONGO_URI:
    # Please secure this in production
    MONGO_URI = "mongodb+srv://yuvrajk863888_db_user:aMnHBizntIPta5VX@cluster0.x4euc3w.mongodb.net/awaaz_setu_db?retryWrites=true&w=majority&appName=Cluster0"

try:
    client = MongoClient(MONGO_URI)
    db = client['awaaz_setu_db']
    logs_collection = db['query_logs']
except Exception as e:
    print(f"DB Error: {e}")

KNOWLEDGE = {
    "greetings": {
        "en": "Hello! I am AwaazSetu, your government assistant. I can help with health schemes, ration cards, and emergency services.",
        "hi": "नमस्ते! मैं आवाज़सेतु हूँ। मैं स्वास्थ्य, राशन और आपातकालीन सेवाओं की जानकारी में आपकी मदद कर सकता हूँ।"
    },
    "help": {
        "en": "I can assist with: 1. Ayushman Bharat details, 2. Ration Card application, 3. PM Kisan status, and 4. Emergency contacts.",
        "hi": "मैं मदद कर सकता हूँ: 1. आयुष्मान भारत, 2. राशन कार्ड प्रक्रिया, 3. पीएम किसान स्थिति, और 4. आपातकालीन नंबर।"
    },
    "ayushman": {
        "en": "Ayushman Bharat (PM-JAY) offers ₹5 Lakhs free health cover per family per year. Apply at any PMJAY hospital with your Aadhaar.",
        "hi": "आयुष्मान भारत योजना परिवारों के लिए प्रति वर्ष ₹5 लाख का मुफ्त स्वास्थ्य कवर देती है। अपने आधार और राशन कार्ड के साथ आवेदन करें।"
    },
    "ration": {
        "en": "For a Ration Card, visit your local Food & Supplies office. Documents required: Aadhaar, Residence proof, and Income certificate.",
        "hi": "राशन कार्ड के लिए स्थानीय खाद्य कार्यालय जाएं। आवश्यक दस्तावेज: आधार, निवास प्रमाण और आय प्रमाण पत्र।"
    },
    "emergency": {
        "en": "Emergency numbers: Dial 112 (All-in-one), 100 (Police), 108 (Ambulance), or 101 (Fire). Help is available 24/7.",
        "hi": "आपातकालीन नंबर: 112 (सभी के लिए), 100 (पुलिस), 108 (एम्बुलेंस), या 101 (दमकल)।"
    }
}

FALLBACKS = {
    "en": ["I'm not sure about that. Try asking about Ayushman Bharat or Ration Cards.", "Try asking for 'Help'."],
    "hi": ["मुझे इसके बारे में पता नहीं है। आयुष्मान भारत या राशन कार्ड के बारे में पूछें।", "सेवाओं की सूची के लिए 'मदद' कहें।"]
}

def get_intent(text):
    t = text.lower()
    if any(x in t for x in ["hi", "hello", "नमस्ते", "हेलो"]): return "greetings"
    if any(x in t for x in ["help", "मदद", "सहायता"]): return "help"
    if any(x in t for x in ["ayushman", "bharat", "आयुष्मान"]): return "ayushman"
    if any(x in t for x in ["ration", "राशन"]): return "ration"
    if any(x in t for x in ["emergency", "police", "आपातकाल"]): return "emergency"
    return "default"

# Serve HTML Files
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/history.html')
def history_page():
    return app.send_static_file('history.html')

# API Endpoints
@app.route("/api/query", methods=["POST"])
def handle_query():
    data = request.json
    user_text = data.get("text", "")
    lang = data.get("language", "en")
    intent = get_intent(user_text)
    
    response = KNOWLEDGE[intent][lang] if intent != "default" else random.choice(FALLBACKS[lang])
        
    logs_collection.insert_one({
        "text": user_text, 
        "response": response, 
        "language": lang, 
        "timestamp": datetime.utcnow()
    })
    return jsonify({"response": response})

@app.route("/api/history", methods=["GET"])
def get_history():
    try:
        # Fetches ALL logs (pagination handled by JS)
        history = list(logs_collection.find().sort("timestamp", -1))
        
        for item in history:
            item["_id"] = str(item["_id"])
            item["time"] = item["timestamp"].strftime("%H:%M")
            
        return jsonify(history)
    except Exception as e:
        print(f"History Error: {e}")
        return jsonify([])

@app.route("/api/clear", methods=["POST"])
def clear_history():
    try:
        logs_collection.delete_many({})
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
