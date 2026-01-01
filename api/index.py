from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Restored & Expanded Knowledge Base
SMART_RESPONSES = {
    "greeting": {
        "en": ["Hello! I am AwaazSetu. How can I assist you with healthcare or government services today?"],
        "hi": ["नमस्ते! मैं आवाज़सेतु हूँ। मैं आज स्वास्थ्य या सरकारी सेवाओं में आपकी कैसे मदद कर सकता हूँ?"]
    },
    "emergency": {
        "en": ["EMERGENCY: Call 112 (All-in-one), 108 (Ambulance), or 101 (Fire) immediately."],
        "hi": ["आपातकाल: तुरंत 112 (सब-इन-वन), 108 (एम्बुलेंस), या 101 (फायर) पर कॉल करें।"]
    },
    "maternity": {
        "en": ["Pregnant women receive free checkups and delivery under JSY. Register at your local Anganwadi."],
        "hi": ["गर्भवती महिलाओं को JSY के तहत मुफ्त जांच और प्रसव मिलता है। अपनी स्थानीय आंगनवाड़ी में पंजीकरण करें।"]
    },
    "ayushman": {
        "en": ["Ayushman Bharat provides ₹5 lakh free treatment per year. Use your Golden Card at any empanelled hospital."],
        "hi": ["आयुष्मान भारत प्रति वर्ष ₹5 लाख का मुफ्त इलाज प्रदान करता है। किसी भी सूचीबद्ध अस्पताल में अपने गोल्डन कार्ड का उपयोग करें।"]
    },
    "ration": {
        "en": ["Apply for a New Ration Card at the State Food Portal. You need Aadhaar and address proof."],
        "hi": ["राज्य खाद्य पोर्टल पर नए राशन कार्ड के लिए आवेदन करें। आपको आधार और पते के प्रमाण की आवश्यकता होगी।"]
    },
    "default": {
        "en": ["I'm not sure. Try asking about 'Hospitals', 'Ration Cards', 'Pensions', or 'Emergency'."],
        "hi": ["मुझे यकीन नहीं है। 'अस्पताल', 'राशन कार्ड', 'पेंशन', या 'आपातकाल' के बारे में पूछने का प्रयास करें।"]
    }
}

def detect_intent(text, service, language):
    t = text.lower().strip()

    # Emergency Cluster
    if any(x in t for x in ["emergency", "police", "112", "accident", "fire", "safety", "help", "आपात", "पुलिस", "खतरा"]):
        return "emergency_numbers"

    # Healthcare Cluster
    if any(x in t for x in ["hospital", "doctor", "clinic", "medical", "sick", "अस्पताल", "डॉक्टर", "तबीयत"]):
        return "hospital_near_me"
    
    if any(x in t for x in ["pregnancy", "baby", "delivery", "maternity", "गर्भवती", "प्रसव"]):
        return "pregnancy"

    # Government Schemes Cluster
    if any(x in t for x in ["ration", "quota", "food card", "wheat", "राशन", "कोटा"]):
        return "ration_card"
    
    if any(x in t for x in ["ayushman", "golden card", "5 lakh", "health card", "आयुष्मान"]):
        return "ayushman_bharat"

    if any(x in t for x in ["pension", "60 years", "old age", "पेंशन"]):
        return "pension"

    # Greeting
    if any(x in t for x in ["hi", "hello", "namaste", "नमस्ते"]):
        return "greeting"

    return "default"
    
@app.route("/api/query", methods=["POST"])
def process_query():
    data = request.json
    text = data.get("text", "")
    lang = data.get("language", "en")
    intent = detect_intent(text)
    response = SMART_RESPONSES.get(intent, SMART_RESPONSES["default"])[lang]
    if isinstance(response, list): response = random.choice(response)
    return jsonify({"response": response})
