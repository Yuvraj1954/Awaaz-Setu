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
    print("Warning: firebase-admin not installed. Using fallback mode.")

# Get absolute path to public folder for Vercel compatibility
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

app = Flask(__name__, static_folder="public")
CORS(app)

# ---------------- FIREBASE INITIALIZATION ----------------

db = None
firebase_initialized = False

def init_firebase():
    """Initialize Firebase safely. Does not crash if env var is missing."""
    global db, firebase_initialized
    
    if not FIREBASE_AVAILABLE:
        print("Firebase not available - using fallback mode")
        return False
    
    try:
        firebase_service_account = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
        
        if not firebase_service_account:
            print("FIREBASE_SERVICE_ACCOUNT not set - using fallback mode")
            return False
        
        # Parse the service account JSON
        service_account_info = json.loads(firebase_service_account)
        
        # Initialize Firebase if not already initialized
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        firebase_initialized = True
        print("Firebase initialized successfully")
        return True
        
    except json.JSONDecodeError:
        print("Invalid FIREBASE_SERVICE_ACCOUNT JSON - using fallback mode")
        return False
    except Exception as e:
        print(f"Firebase initialization error: {e} - using fallback mode")
        return False

# Initialize Firebase on startup
init_firebase()

# ---------------- FALLBACK RESPONSES ----------------

FALLBACK_RESPONSES = {
    "en": {
        "general": "I'm here to help you with government and healthcare services. How can I assist you today?",
        "government": "Please visit the nearest government office or call the helpline for assistance.",
        "healthcare": "For medical concerns, please visit a government hospital or contact a healthcare provider."
    },
    "hi": {
        "general": "मैं सरकारी और स्वास्थ्य सेवाओं में आपकी मदद के लिए यहाँ हूँ। मैं आपकी कैसे सहायता कर सकता हूँ?",
        "government": "कृपया सहायता के लिए निकटतम सरकारी कार्यालय जाएं या हेल्पलाइन पर कॉल करें।",
        "healthcare": "चिकित्सा संबंधी चिंताओं के लिए, कृपया सरकारी अस्पताल जाएं या स्वास्थ्य सेवा प्रदाता से संपर्क करें।"
    }
}

# ---------------- INTENT DETECTION ----------------

GREETING_KEYWORDS = {
    "en": ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "greetings", "namaste"],
    "hi": ["नमस्ते", "नमस्कार", "हेलो", "हाय", "सुप्रभात", "शुभ संध्या", "नमस्कार"]
}

def detect_greeting(text, language):
    """Detect if the text is a greeting."""
    text_lower = text.lower().strip()
    
    # Check for greeting keywords
    keywords = GREETING_KEYWORDS.get(language, [])
    for keyword in keywords:
        if keyword in text_lower:
            return True
    
    return False

def detect_intent(text, service, language):
    """
    Detect intent from user text using keyword matching.
    Returns intent string or 'default' if no match.
    """
    text_lower = text.lower().strip()
    
    # Check for greeting first (works for any service)
    if detect_greeting(text, language):
        return "greeting"
    
    # Emergency numbers intent (works for any service)
    emergency_keywords_en = ["emergency number", "police number", "ambulance number", "fire number", "help number", "sos", "emergency numbers"]
    emergency_keywords_hi = ["इमरजेंसी नंबर", "पुलिस नंबर", "एम्बुलेंस नंबर", "फायर ब्रिगेड नंबर", "मदद नंबर", "आपातकाल नंबर", "आपातकालीन नंबर"]
    if language == "en":
        if any(keyword in text_lower for keyword in emergency_keywords_en):
            return "emergency_numbers"
    else:
        if any(keyword in text_lower for keyword in emergency_keywords_hi):
            return "emergency_numbers"
    
    # Help intent
    help_keywords_en = ["help", "what can you do", "how can you help", "what services", "assistance"]
    help_keywords_hi = ["मदद", "सहायता", "क्या कर सकते हो", "क्या सेवाएं", "कैसे मदद"]
    if language == "en":
        if any(keyword in text_lower for keyword in help_keywords_en):
            return "help"
    else:
        if any(keyword in text_lower for keyword in help_keywords_hi):
            return "help"
    
    # About platform intent
    about_keywords_en = ["about", "what is", "tell me about", "explain"]
    about_keywords_hi = ["के बारे में", "क्या है", "बताओ", "समझाओ"]
    if language == "en":
        if any(keyword in text_lower for keyword in about_keywords_en):
            return "about_platform"
    else:
        if any(keyword in text_lower for keyword in about_keywords_hi):
            return "about_platform"
    
    # Service-specific intents - check all if service is "auto" or "general"
    check_all_services = service in ["auto", "general"] or service == "government"
    
    # Government intents
    if check_all_services or service == "government":
        # Ayushman Bharat
        if any(kw in text_lower for kw in ["ayushman", "आयुष्मान", "health card", "स्वास्थ्य कार्ड"]):
            return "ayushman_bharat"
        # Ration Card
        if any(kw in text_lower for kw in ["ration card", "राशन कार्ड", "ration", "राशन"]):
            return "ration_card"
        # Pension
        if any(kw in text_lower for kw in ["pension", "पेंशन", "वृद्धावस्था"]):
            return "pension"
        # Aadhar
        if any(kw in text_lower for kw in ["aadhar", "aadhaar", "आधार", "uid"]):
            return "aadhar"
        # Voter ID
        if any(kw in text_lower for kw in ["voter", "voting", "मतदाता", "वोटर"]):
            return "voter_id"
        # Housing
        if any(kw in text_lower for kw in ["housing", "house", "home", "घर", "आवास", "पीएम आवास"]):
            return "housing"
        # Birth Certificate
        if any(kw in text_lower for kw in ["birth certificate", "जन्म प्रमाण पत्र", "birth", "जन्म"]):
            return "birth_certificate"
        # Income Certificate
        if any(kw in text_lower for kw in ["income certificate", "आय प्रमाण पत्र", "income", "आय"]):
            return "income_certificate"
    
    # Healthcare intents - check all if service is "auto" or "general"
    check_healthcare = service in ["auto", "general"] or service == "healthcare"
    
    if check_healthcare or service == "healthcare":
        # Fever
        if any(kw in text_lower for kw in ["fever", "बुखार", "temperature", "तापमान"]):
            return "fever"
        # Cough/Cold
        if any(kw in text_lower for kw in ["cough", "cold", "खांसी", "जुकाम", "सर्दी"]):
            return "cough_cold"
        # Stomach Pain
        if any(kw in text_lower for kw in ["stomach", "stomach pain", "पेट", "पेट दर्द", "उदर"]):
            return "stomach_pain"
        # Headache
        if any(kw in text_lower for kw in ["headache", "head pain", "सिर दर्द", "माइग्रेन"]):
            return "headache"
        # Pregnancy
        if any(kw in text_lower for kw in ["pregnancy", "pregnant", "गर्भावस्था", "गर्भवती"]):
            return "pregnancy"
        # Vaccination
        if any(kw in text_lower for kw in ["vaccination", "vaccine", "टीका", "वैक्सीन", "immunization"]):
            return "vaccination"
        # Child Health
        if any(kw in text_lower for kw in ["child", "baby", "infant", "बच्चा", "शिशु", "बाल"]):
            return "child_health"
        # Emergency
        if any(kw in text_lower for kw in ["emergency", "urgent", "अस्पताल", "आपातकाल", "जल्दी"]):
            return "emergency_guidance"
    
    return "default"

# ---------------- FIREBASE QUERY FUNCTIONS ----------------

def get_response_from_firebase(service, language, intent):
    """
    Query Firestore for response.
    Fallback order: exact intent → default intent → safe generic response
    """
    if not firebase_initialized or db is None:
        return None
    
    try:
        # Try exact match first: service + language + intent
        query = db.collection("responses").where("service", "==", service).where("language", "==", language).where("intent", "==", intent).limit(1)
        docs = query.stream()
        
        for doc in docs:
            data = doc.to_dict()
            if "response" in data:
                return data["response"]
        
        # Fallback: try default intent for the service
        if intent != "default":
            query = db.collection("responses").where("service", "==", service).where("language", "==", language).where("intent", "==", "default").limit(1)
            docs = query.stream()
            
            for doc in docs:
                data = doc.to_dict()
                if "response" in data:
                    return data["response"]
        
        # Final fallback: general default
        query = db.collection("responses").where("service", "==", "general").where("language", "==", language).where("intent", "==", "default").limit(1)
        docs = query.stream()
        
        for doc in docs:
            data = doc.to_dict()
            if "response" in data:
                return data["response"]
        
    except Exception as e:
        print(f"Firebase query error: {e}")
    
    return None

def get_response(service, language, intent):
    """
    Get response from Firebase or fallback.
    Never crashes - always returns a response string.
    """
    # Try Firebase first
    response = get_response_from_firebase(service, language, intent)
    
    if response:
        return response
    
    # Fallback to safe generic responses
    if intent == "greeting":
        if language == "en":
            return "Hello! How can I help you today?"
        else:
            return "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?"
    
    if intent == "emergency_numbers":
        if language == "en":
            return "Here are important emergency numbers in India. Police 112. Ambulance 108. Fire 101. Women helpline 181. Child helpline 1098. Disaster management 1078. Please call these numbers in case of emergency."
        else:
            return "भारत में जरूरी आपातकालीन नंबर हैं। पुलिस 112। एम्बुलेंस 108। फायर ब्रिगेड 101। महिला हेल्पलाइन 181। चाइल्ड हेल्पलाइन 1098। आपदा प्रबंधन 1078। कृपया आपातकाल में इन नंबरों पर कॉल करें।"
    
    if intent == "help":
        if language == "en":
            return "I can help you with government services like Ayushman Bharat, ration cards, pensions, and healthcare information. What would you like to know?"
        else:
            return "मैं आयुष्मान भारत, राशन कार्ड, पेंशन जैसी सरकारी सेवाओं और स्वास्थ्य जानकारी में आपकी मदद कर सकता हूँ। आप क्या जानना चाहेंगे?"
    
    # Use service-specific fallback
    return FALLBACK_RESPONSES.get(language, FALLBACK_RESPONSES["en"]).get(service, FALLBACK_RESPONSES["en"]["general"])
    
    # ---------------- EXTRA STATIC RESPONSES (PROMPT SAFE) ----------------

STATIC_PROMPT_RESPONSES = {
    "emergency_numbers": {
        "en": "Emergency numbers in India: Police 112, Ambulance 108, Fire 101, Women 181, Child 1098.",
        "hi": "भारत के आपातकालीन नंबर: पुलिस 112, एम्बुलेंस 108, फायर 101, महिला 181, चाइल्ड 1098।"
    },
    "hospital_near_me": {
        "en": "You can visit the nearest government hospital or call 108 for ambulance assistance.",
        "hi": "आप नजदीकी सरकारी अस्पताल जा सकते हैं या एम्बुलेंस के लिए 108 पर कॉल करें।"
    },
    "old_age_pension": {
        "en": "Old age pension is provided under NSAP. Apply via state portal or nearest CSC.",
        "hi": "वृद्धावस्था पेंशन NSAP के अंतर्गत मिलती है। आवेदन राज्य पोर्टल या CSC से करें।"
    },
    "vaccination": {
        "en": "Vaccination details are available on CoWIN portal or nearest PHC.",
        "hi": "टीकाकरण की जानकारी CoWIN पोर्टल या नजदीकी PHC से लें।"
    },
    "government_scheme": {
        "en": "Popular schemes include Ayushman Bharat, PM Awas Yojana, and Pension schemes.",
        "hi": "लोकप्रिय योजनाएँ: आयुष्मान भारत, पीएम आवास योजना और पेंशन योजनाएँ।"
    }
}


# ---------------- API ROUTE ----------------

@app.route("/api/query", methods=["POST"])
def process_query():
    """Process user query with intent detection and Firebase lookup."""
    try:
        data = request.json
        text = data.get("text", "").strip()
        service = data.get("service", "auto")
        language = data.get("language", "en")
        
        # Handle auto service - use "general" for database lookup
        # Intent detection will determine the appropriate service
        if service == "auto":
            service = "general"
        
        # Handle empty input
        if not text:
            response = "Please speak your question." if language == "en" else "कृपया बोलें।"
            return jsonify({
                "response": response,
                "success": True
            })
        
        # Detect intent (service parameter is used for context, but auto-detection handles it)
        detected_intent = detect_intent(text, service, language)
        
        # Determine service from intent for database lookup
        # General intents (greeting, help, emergency_numbers, about_platform)
        if detected_intent in ["greeting", "help", "emergency_numbers", "about_platform", "default"]:
            lookup_service = "general"
        # Government intents
        elif detected_intent in ["ayushman_bharat", "ration_card", "pension", "aadhar", "voter_id", "housing", "birth_certificate", "income_certificate"]:
            lookup_service = "government"
        # Healthcare intents
        elif detected_intent in ["fever", "cough_cold", "stomach_pain", "headache", "pregnancy", "vaccination", "child_health", "emergency_guidance"]:
            lookup_service = "healthcare"
        else:
            # Fallback to provided service or general
            lookup_service = service if service != "auto" else "general"
        
        # Get response from Firebase or fallback
        response = get_response(lookup_service, language, detected_intent)
        
        return jsonify({
            "response": response,
            "intent": detected_intent,
            "success": True
        })
        
    except Exception as e:
        print(f"Error processing query: {e}")
        # Always return a response, never crash
        language = request.json.get("language", "en") if request.json else "en"
        fallback = "I apologize, but I'm having trouble processing your request. Please try again." if language == "en" else "क्षमा करें, मुझे आपके अनुरोध को संसाधित करने में समस्या हो रही है। कृपया पुनः प्रयास करें।"
        return jsonify({
            "response": fallback,
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
