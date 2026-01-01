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

# --- ENHANCED KNOWLEDGE BASE ---
KNOWLEDGE = {
    "greetings": {
        "en": "Namaste! I am AwaazSetu, your digital bridge to government services. I am here to guide you through Health Schemes, Ration Cards, Farmer Benefits (PM Kisan), and Emergency Services. How may I serve you today?",
        "hi": "नमस्ते! मैं आवाज़सेतु हूँ - सरकारी सेवाओं के लिए आपका डिजिटल सहायक। मैं आयुष्मान भारत, राशन कार्ड, किसान सम्मान निधि और आपातकालीन सेवाओं के बारे में विस्तृत जानकारी दे सकता हूँ। बताइए, आज मैं आपकी कैसे सहायता करूँ?"
    },
    "help": {
        "en": "I can assist you with the following:\n1. **Ayushman Bharat**: Health coverage of ₹5 Lakhs.\n2. **Ration Card**: Application process and documents.\n3. **PM Kisan**: ₹6,000/year farmer benefits and status.\n4. **Emergency**: Instant access to Police (100) & Ambulance (108).\n\nTry asking: 'How do I apply for a Ration Card?'",
        "hi": "मैं निम्नलिखित में आपकी सहायता कर सकता हूँ:\n1. **आयुष्मान भारत**: ₹5 लाख का स्वास्थ्य बीमा।\n2. **राशन कार्ड**: आवेदन प्रक्रिया और दस्तावेज।\n3. **पीएम किसान**: ₹6,000/वर्ष की किसान सहायता।\n4. **आपातकाल**: पुलिस (100) और एम्बुलेंस (108)।\n\nपूछ कर देखें: 'राशन कार्ड कैसे बनवाएं?'"
    },
    "ayushman": {
        "en": "Under **Ayushman Bharat (PM-JAY)**, your family is entitled to **₹5 Lakhs of free health coverage annually**. You can receive cashless treatment at any empanelled public or private hospital. To apply, visit your nearest Common Service Centre (CSC) or government hospital with your **Aadhaar Card and Ration Card**. You can also generate your ABHA Health ID at healthid.ndhm.gov.in.",
        "hi": "आयुष्मान भारत (PM-JAY) के तहत आपके परिवार को **प्रति वर्ष ₹5 लाख का मुफ्त स्वास्थ्य बीमा** मिलता है। आप किसी भी सूचीबद्ध सरकारी या निजी अस्पताल में कैशलेस इलाज करा सकते हैं। आवेदन के लिए अपने **आधार और राशन कार्ड** के साथ नजदीकी जन सेवा केंद्र (CSC) या सरकारी अस्पताल जाएं। आप healthid.ndhm.gov.in पर अपनी हेल्थ आईडी भी बना सकते हैं।"
    },
    "ration": {
        "en": "To apply for a **Ration Card**, visit your local Food & Civil Supplies Department office or the nearest Seva Kendra. \n**Required Documents:**\n1. Aadhaar Cards of all family members\n2. Proof of Residence (Electricity/Water Bill)\n3. Income Certificate\n4. Passport-sized photographs.\nThis card ensures subsidized food grains under the NFSA.",
        "hi": "नए **राशन कार्ड** के लिए अपने स्थानीय खाद्य एवं आपूर्ति विभाग या सेवा केंद्र पर जाएं।\n**आवश्यक दस्तावेज:**\n1. परिवार के सभी सदस्यों का आधार कार्ड\n2. निवास प्रमाण पत्र (बिजली/पानी का बिल)\n3. आय प्रमाण पत्र\n4. पासपोर्ट फोटो।\nयह कार्ड आपको सरकारी दर पर अनाज सुनिश्चित करता है।"
    },
    "pmkisan": {
        "en": "The **PM Kisan Samman Nidhi Yojana** provides **₹6,000 per year** to eligible farmer families, paid in three installments of ₹2,000 directly into your bank account. To register or check your beneficiary status, visit **pmkisan.gov.in** or contact the PM-Kisan Helpline at **155261**.",
        "hi": "**पीएम किसान सम्मान निधि योजना** पात्र किसानों को **₹6,000 प्रति वर्ष** की सहायता देती है, जो ₹2,000 की तीन किस्तों में सीधे बैंक खाते में आती है। पंजीकरण करने या भुगतान की स्थिति (Status) देखने के लिए **pmkisan.gov.in** पर जाएं या पीएम-किसान हेल्पलाइन **155261** पर कॉल करें।"
    },
    "emergency": {
        "en": "In case of emergency, help is available 24/7. Dial these numbers immediately:\n* **112**: All-in-One Emergency Helpline\n* **100**: Police Control Room\n* **108**: Ambulance / Medical Emergency\n* **101**: Fire Brigade\nYour safety is our priority.",
        "hi": "आपातकालीन स्थिति में सहायता 24/7 उपलब्ध है। तुरंत इन नंबरों पर कॉल करें:\n* **112**: आपातकालीन हेल्पलाइन (सभी के लिए)\n* **100**: पुलिस\n* **108**: एम्बुलेंस / चिकित्सा सेवा\n* **101**: दमकल (Fire Brigade)\nआपकी सुरक्षा हमारी प्राथमिकता है।"
    }
}

FALLBACKS = {
    "en": ["I am not sure about that specific query. Please try asking about 'Ayushman Bharat', 'Ration Card', or 'PM Kisan'.", "I can help with Government Schemes. Try asking 'Help' to see options."],
    "hi": ["क्षमा करें, मुझे इसके बारे में जानकारी नहीं है। कृपया 'आयुष्मान भारत', 'राशन कार्ड' या 'पीएम किसान' के बारे में पूछें।", "मैं सरकारी योजनाओं में मदद कर सकता हूँ। विकल्प देखने के लिए 'मदद' कहें।"]
}

# --- SMARTER INTENT DETECTION ---
def get_intent(text):
    t = text.lower()
    
    # 1. Greetings
    if any(x in t for x in ["hi", "hello", "namaste", "नमस्ते", "हेलो"]): return "greetings"
    
    # 2. PM Kisan / Farmer Info (Catches "farmer", "benefits", "kisan")
    if any(x in t for x in ["pm kisan", "farmer", "kisan", "benefits", "पीएम किसान", "किसान", "फायदे", "benefit"]): return "pmkisan"
    
    # 3. Ayushman / Health / Hospitals (Catches "hospital", "health id")
    if any(x in t for x in ["ayushman", "health", "hospital", "doctor", "आयुष्मान", "स्वास्थ्य", "अस्पताल", "हेल्थ", "id"]): return "ayushman"
    
    # 4. Ration / Apply Card (Catches "apply", "card", "ration")
    if any(x in t for x in ["ration", "food", "apply", "card", "राशन", "कार्ड", "आवेदन", "grain"]): return "ration"
    
    # 5. Emergency (Catches "100", "108", "police")
    if any(x in t for x in ["emergency", "police", "ambulance", "100", "108", "fire", "112", "आपातकाल", "पुलिस", "एम्बुलेंस"]): return "emergency"
    
    # 6. Help / Status / Contact (Catches generic help terms)
    if any(x in t for x in ["help", "contact", "status", "info", "support", "मदद", "संपर्क", "स्थिति", "जानकारी"]): return "help"
    
    return "default"

# --- ROUTES ---
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/history.html')
def history_page():
    return app.send_static_file('history.html')

@app.route("/api/query", methods=["POST"])
def handle_query():
    data = request.json
    user_text = data.get("text", "")
    lang = data.get("language", "en")
    intent = get_intent(user_text)
    
    if intent != "default":
        response = KNOWLEDGE[intent][lang]
    else:
        response = random.choice(FALLBACKS[lang])
        
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
        # Fetch ALL logs sorted by newest first
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
