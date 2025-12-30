import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Get absolute path to public folder for Vercel compatibility
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

app = Flask(__name__, static_folder="public")
CORS(app)

# ---------------- MOCK DATA (PRIMARY FOR DEMO) ----------------

MOCK_DATA = [
    {"service": "government", "language": "en", "intent": "ayushman_bharat",
     "response": "Ayushman Bharat provides free healthcare up to 5 lakh rupees at government hospitals."},

    {"service": "government", "language": "hi", "intent": "ayushman_bharat",
     "response": "आयुष्मान भारत योजना में 5 लाख रुपये तक मुफ्त इलाज मिलता है।"},

    {"service": "healthcare", "language": "en", "intent": "fever",
     "response": "If you have fever, rest well and drink fluids. Visit a government hospital if it lasts more than 3 days."},

    {"service": "healthcare", "language": "hi", "intent": "fever",
     "response": "अगर बुखार है तो आराम करें और पानी पिएं। 3 दिन से ज्यादा हो तो सरकारी अस्पताल जाएं।"}
]

# ---------------- INTENT DETECTION ----------------

def detect_intent(text, service):
    text = text.lower()
    if service == "government":
        if "ayushman" in text or "आयुष्मान" in text:
            return "ayushman_bharat"
    if service == "healthcare":
        if "fever" in text or "बुखार" in text:
            return "fever"
    return "default"

def get_response(service, language, intent):
    for item in MOCK_DATA:
        if item["service"] == service and item["language"] == language and item["intent"] == intent:
            return item["response"]
    return "Please visit the nearest government office." if language == "en" else "कृपया पास के सरकारी दफ्तर जाएं।"

# ---------------- API ROUTE ----------------

@app.route("/api/query", methods=["POST"])
def process_query():
    data = request.json
    text = data.get("text", "")
    service = data.get("service", "government")
    language = data.get("language", "en")

    if not text.strip():
        return jsonify({
            "response": "Please speak your question." if language == "en" else "कृपया बोलें।",
            "success": True
        })

    intent = detect_intent(text, service)
    response = get_response(service, language, intent)

    return jsonify({
        "response": response,
        "intent": intent,
        "success": True
    })

# ---------------- FRONTEND ROUTES ----------------

@app.route("/")
def index():
    return send_from_directory(PUBLIC_DIR, "index.html")

@app.route("/<path:path>")
def static_files(path):
    # Only serve files that exist in public directory
    if os.path.exists(os.path.join(PUBLIC_DIR, path)):
        return send_from_directory(PUBLIC_DIR, path)
    # If file doesn't exist, serve index.html for SPA routing
    return send_from_directory(PUBLIC_DIR, "index.html")

# ⚠️ IMPORTANT: DO NOT USE app.run() ON VERCEL
# The app instance is automatically detected by Vercel's Python runtime
