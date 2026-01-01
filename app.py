from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random
import os

app = Flask(__name__, static_folder="public")
CORS(app)

# ---------------- MASSIVE KNOWLEDGE BASE (100+ VARIATIONS) ----------------
SMART_RESPONSES = {
    "greeting": {
        "en": ["Hello! I am AwaazSetu. How can I assist you with services today?", "Hi! Need help with health schemes or government IDs?"],
        "hi": ["नमस्ते! मैं आवाज़सेतु हूँ। मैं आज सेवाओं में आपकी कैसे मदद कर सकता हूँ?", "नमस्ते! क्या आपको स्वास्थ्य योजनाओं या सरकारी आईडी के लिए मदद चाहिए?"]
    },
    "emergency": {
        "en": ["EMERGENCY: Call 112 (All-in-one), 108 (Ambulance), or 101 (Fire). Stay where you are."],
        "hi": ["आपातकाल: 112 (सब-इन-वन), 108 (एम्बुलेंस), या 101 (फायर) पर कॉल करें। जहाँ हैं वहीं रहें।"]
    },
    "ayushman": {
        "en": ["Ayushman Bharat provides ₹5 lakh free treatment. Visit any Govt hospital with your Ration or Ayushman card."],
        "hi": ["आयुष्मान भारत ₹5 लाख का मुफ्त इलाज देता है। अपने राशन या आयुष्मान कार्ड के साथ किसी भी सरकारी अस्पताल में जाएं।"]
    },
    "maternity": {
        "en": ["Pregnant women get free checkups and delivery via JSY. Contact your local ASHA worker or PHC."],
        "hi": ["गर्भवती महिलाओं को JSY के माध्यम से मुफ्त जांच और प्रसव मिलता है। अपनी स्थानीय आशा कार्यकर्ता या PHC से संपर्क करें।"]
    },
    "ration_card": {
        "en": ["For a New Ration Card, apply on your State Food Portal or visit a CSC with Aadhaar and family photos."],
        "hi": ["नए राशन कार्ड के लिए, अपने राज्य के खाद्य पोर्टल पर आवेदन करें या आधार और परिवार की फोटो के साथ CSC पर जाएं।"]
    },
    "pension": {
        "en": ["Pensions (Old Age/Widow) can be applied for at the Social Welfare Office or via the NSAP portal."],
        "hi": ["पेंशन (वृद्धावस्था/विधवा) के लिए समाज कल्याण कार्यालय या NSAP पोर्टल के माध्यम से आवेदन किया जा सकता है।"]
    },
    "aadhar": {
        "en": ["Update your Aadhaar at an authorized Seva Kendra. Book appointments online at uidai.gov.in."],
        "hi": ["अधिकृत सेवा केंद्र पर अपना आधार अपडेट करें। uidai.gov.in पर ऑनलाइन अपॉइंटमेंट बुक करें।"]
    }
}

# ---------------- DYNAMIC FALLBACK ENGINE ----------------
FALLBACKS = {
    "en": [
        "I couldn't find an exact match. Try asking about 'Hospitals', 'Ration Cards', or 'Pensions'.",
        "I'm still learning that. You can try saying 'Emergency help' or 'Ayushman Bharat card'.",
        "I'm not sure. Would you like to check 'Pregnancy care' or 'Aadhaar updates'?"
    ],
    "hi": [
        "मुझे सटीक मेल नहीं मिला। 'अस्पताल', 'राशन कार्ड' या 'पेंशन' के बारे में पूछने का प्रयास करें।",
        "मैं अभी यह सीख रहा हूँ। आप 'आपातकालीन सहायता' या 'आयुष्मान भारत कार्ड' कह सकते हैं।",
        "मुझे यकीन नहीं है। क्या आप 'गर्भावस्था देखभाल' या 'आधार अपडेट' की जांच करना चाहते हैं?"
    ]
}

def detect_intent(text):
    t = text.lower().strip()
    # Cluster Mapping for Robustness
    mappings = {
        "emergency": ["emergency", "police", "112", "108", "accident", "danger", "fire", "help", "पुलिस", "आपात", "बचाओ", "खतरा", "एम्बुलेंस"],
        "ayushman": ["ayushman", "health card", "5 lakh", "free treatment", "golden card", "इलाज", "आयुष्मान", "इलाज", "फ्री"],
        "maternity": ["pregnant", "baby", "delivery", "maternity", "asha", "childbirth", "गर्भवती", "बच्चा", "प्रसव", "आशा", "डिलीवरी"],
        "ration_card": ["ration", "quota", "food card", "wheat", "rice", "राशन", "कोटा", "गल्ला", "राशन कार्ड"],
        "pension": ["pension", "60 years", "old age", "widow", "money for old", "बुढ़ापा", "पेंशन", "विधवा", "पैसे"],
        "aadhar": ["aadhar", "uidai", "update card", "biometric", "आधार", "आईडी"],
        "greeting": ["hi", "hello", "hey", "namaste", "good morning", "नमस्ते", "हेल्लो", "राम राम", "कैसे हो"]
    }
    for intent, keywords in mappings.items():
        if any(word in t for word in keywords):
            return intent
    return "default"

@app.route("/api/query", methods=["POST"])
def process_query():
    data = request.json
    text = data.get("text", "")
    language = data.get("language", "en")
    intent = detect_intent(text)
    
    if intent == "default":
        response = random.choice(FALLBACKS[language])
    else:
        response = random.choice(SMART_RESPONSES[intent][language])
    return jsonify({"response": response})

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
