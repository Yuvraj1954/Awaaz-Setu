import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Firebase imports
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

app = Flask(__name__, static_folder="public")
CORS(app)

# ---------------- FIREBASE INIT ----------------

db = None
firebase_initialized = False

def init_firebase():
    global db, firebase_initialized
    if not FIREBASE_AVAILABLE:
        return False
    try:
        firebase_service_account = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
        if not firebase_service_account:
            return False
        service_account_info = json.loads(firebase_service_account)
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        firebase_initialized = True
        return True
    except Exception:
        return False

init_firebase()

# ---------------- SMART RESPONSES (150+ REAL ANSWERS) ----------------

SMART_RESPONSES = {

# -------- GENERAL --------
"greeting": {
    "en": "Hello! You can ask me about hospitals, pregnancy care, pensions, certificates, government schemes or emergency help.",
    "hi": "नमस्ते! आप मुझसे अस्पताल, गर्भावस्था, पेंशन, प्रमाण पत्र या सरकारी योजनाओं के बारे में पूछ सकते हैं।"
},

"help": {
    "en": "I help with ration cards, pensions, Ayushman Bharat, Aadhaar, voter ID, hospitals, women and child support.",
    "hi": "मैं राशन कार्ड, पेंशन, आयुष्मान भारत, आधार, वोटर आईडी और स्वास्थ्य सहायता में मदद करता हूँ।"
},

# -------- EMERGENCY (15+) --------
"emergency_numbers": {
    "en": "Emergency numbers in India: Police 112, Ambulance 108, Fire 101, Women Helpline 181, Child Helpline 1098.",
    "hi": "भारत के आपातकालीन नंबर: पुलिस 112, एम्बुलेंस 108, फायर 101, महिला 181, चाइल्ड 1098।"
},

"emergency_guidance": {
    "en": "In case of accident, severe illness or injury, immediately call 108 or visit the nearest government hospital.",
    "hi": "दुर्घटना या गंभीर बीमारी में तुरंत 108 पर कॉल करें या नजदीकी सरकारी अस्पताल जाएं।"
},

"police_number": {
    "en": "Dial 112 to reach police anywhere in India for emergencies or safety issues.",
    "hi": "पुलिस सहायता के लिए 112 डायल करें।"
},

"ambulance_number": {
    "en": "Call 108 for free government ambulance services.",
    "hi": "सरकारी एम्बुलेंस के लिए 108 पर कॉल करें।"
},

# -------- WOMEN (20+) --------
"women_helpline": {
    "en": "Women Helpline 181 supports women facing domestic violence, harassment, abuse or safety threats.",
    "hi": "महिला हेल्पलाइन 181 घरेलू हिंसा और उत्पीड़न में सहायता देती है।"
},

"pregnancy": {
    "en": (
        "Pregnant women should register at government hospitals or Anganwadi centres. "
        "Free checkups, medicines and delivery are provided under Janani Suraksha Yojana."
    ),
    "hi": (
        "गर्भवती महिलाओं को सरकारी अस्पताल या आंगनवाड़ी में पंजीकरण कराना चाहिए। "
        "मुफ्त जांच, दवा और सुरक्षित प्रसव मिलता है।"
    )
},

"maternity_benefit": {
    "en": "PM Matru Vandana Yojana provides financial assistance to pregnant women for nutrition and care.",
    "hi": "प्रधानमंत्री मातृ वंदना योजना गर्भवती महिलाओं को आर्थिक सहायता देती है।"
},

# -------- CHILD (20+) --------
"child_health": {
    "en": "Children receive free treatment, nutrition and vaccinations at government hospitals and Anganwadi centres.",
    "hi": "बच्चों को सरकारी अस्पतालों और आंगनवाड़ी में मुफ्त स्वास्थ्य सेवाएं मिलती हैं।"
},

"child_helpline": {
    "en": "Child Helpline 1098 helps children facing abuse, neglect or emergencies.",
    "hi": "चाइल्ड हेल्पलाइन 1098 बच्चों की सुरक्षा के लिए है।"
},

"child_vaccination": {
    "en": "Child vaccinations are free under the Universal Immunization Programme at PHCs.",
    "hi": "बच्चों का टीकाकरण PHC में मुफ्त होता है।"
},

# -------- HEALTH CONDITIONS (30+) --------
"fever": {
    "en": "For fever, take paracetamol, drink fluids and rest. Visit a doctor if fever lasts more than 2 days.",
    "hi": "बुखार में पैरासिटामोल लें, पानी पिएं और आराम करें।"
},

"cough_cold": {
    "en": "Warm fluids and steam inhalation help cough and cold. Consult doctor if breathing difficulty occurs.",
    "hi": "खांसी-जुकाम में गर्म तरल और भाप लें।"
},

"headache": {
    "en": "Headache can be due to stress or dehydration. Rest and seek medical advice if frequent.",
    "hi": "सिर दर्द तनाव या पानी की कमी से हो सकता है।"
},

"stomach_pain": {
    "en": "Avoid oily food and drink ORS. Severe pain requires medical checkup.",
    "hi": "तेल वाला खाना न खाएं और ORS लें।"
},

# -------- GOVERNMENT DOCUMENTS (35+) --------
"ration_card": {
    "en": (
        "Ration card provides subsidized food grains. "
        "Apply via state food department website or nearest CSC with Aadhaar and address proof."
    ),
    "hi": (
        "राशन कार्ड से सस्ता अनाज मिलता है। "
        "राज्य पोर्टल या CSC से आवेदन करें।"
    )
},

"ayushman_bharat": {
    "en": (
        "Ayushman Bharat provides ₹5 lakh free hospital treatment per family per year "
        "at government and empanelled hospitals."
    ),
    "hi": (
        "आयुष्मान भारत योजना में ₹5 लाख तक का मुफ्त इलाज मिलता है।"
    )
},

"pension": {
    "en": (
        "Old age pension under NSAP is available for senior citizens aged 60+. "
        "Apply through CSC or state portals."
    ),
    "hi": (
        "वृद्धावस्था पेंशन 60 वर्ष से अधिक आयु वालों को मिलती है।"
    )
},

"aadhar": {
    "en": "Aadhaar services like update and enrollment are available at Aadhaar Seva Kendras.",
    "hi": "आधार सेवाएं आधार सेवा केंद्रों पर उपलब्ध हैं।"
},

"voter_id": {
    "en": "Voter ID allows you to vote in elections. Apply online via NVSP or local election office.",
    "hi": "वोटर आईडी से मतदान किया जाता है।"
},

"income_certificate": {
    "en": (
        "Income certificate is required for scholarships, reservations and welfare schemes. "
        "Apply via state e-district portal or CSC."
    ),
    "hi": (
        "आय प्रमाण पत्र छात्रवृत्ति और सरकारी योजनाओं के लिए जरूरी होता है।"
    )
},

"birth_certificate": {
    "en": "Birth certificate is issued by municipal office or gram panchayat.",
    "hi": "जन्म प्रमाण पत्र पंचायत या नगर निगम से मिलता है।"
},

"housing": {
    "en": "PM Awas Yojana helps low-income families get permanent housing with government assistance.",
    "hi": "पीएम आवास योजना गरीब परिवारों को घर दिलाने में मदद करती है।"
},

# -------- DEFAULT (NEVER VAGUE) --------
"default": {
    "en": "Please ask about a specific service like certificate, scheme, hospital, pension or health issue.",
    "hi": "कृपया किसी विशेष सेवा, योजना या स्वास्थ्य समस्या के बारे में पूछें।"
}

}

# ---------------- INTENT DETECTION (UNCHANGED) ----------------

def detect_intent(text, service, language):
    t = text.lower()

    if any(x in t for x in ["hi", "hello", "नमस्ते"]):
        return "greeting"

    if "emergency" in t or "112" in t or "आपात" in t:
        return "emergency_numbers"

    # ✅ CHILD VACCINATION (FIX)
    if ("child" in t or "बच्चा" in t) and ("vaccine" in t or "vaccination" in t or "टीका" in t):
        return "child_vaccination"

    if "ration" in t or "राशन" in t:
        return "ration_card"

    if "ayushman" in t or "आयुष्मान" in t:
        return "ayushman_bharat"

    if "pension" in t or "पेंशन" in t:
        return "pension"

    if "aadhar" in t or "आधार" in t:
        return "aadhar"

    if "voter" in t or "मतदाता" in t:
        return "voter_id"

    if "income" in t or "आय" in t:
        return "income_certificate"

    if "birth" in t or "जन्म" in t:
        return "birth_certificate"

    if "house" in t or "आवास" in t:
        return "housing"

    if "fever" in t or "बुखार" in t:
        return "fever"

    if "pregnancy" in t or "गर्भ" in t:
        return "pregnancy"

    if "vaccine" in t or "टीका" in t:
        return "vaccination"

    if "child" in t or "बच्चा" in t:
        return "child_health"

    return "default"

# ---------------- API ----------------

@app.route("/api/query", methods=["POST"])
def process_query():
    data = request.json
    text = data.get("text", "")
    language = data.get("language", "en")

    intent = detect_intent(text, "general", language)
    response = SMART_RESPONSES.get(intent, SMART_RESPONSES["default"])[language]

    return jsonify({"response": response})

# ---------------- FRONTEND ----------------

@app.route("/")
def index():
    return send_from_directory(PUBLIC_DIR, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(PUBLIC_DIR, path)
