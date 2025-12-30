# 🎙️ AwaazSetu  
### 🌏 *Voice Bridge to Essential Services for Bharat*

🚨 **IMPORTANT:**  
**Voice features work best in Google Chrome.**  
Please allow microphone access when prompted.

🔗 **LIVE DEMO:**  
👉 **https://awaaz-setu-2.onrender.com/**

---

## 🎙️ Supported Voice & Text Questions

AwaazSetu currently supports the following **exact questions and voice commands**.  
You can either **speak** or **click** these prompts.

### 🔹 Emergency & Safety
- Emergency number  
- Emergency numbers in India  
- Police number  
- Call police  
- Ambulance number  
- Call ambulance  
- Hospital near me  
- Government hospital  
- Nearest hospital  
- Women helpline  
- Call women helpline  
- Child helpline  
- Call child helpline  

### 🔹 Women & Pregnancy
- Pregnancy help  
- Pregnancy care  
- Pregnant women help  
- Government pregnancy scheme  
- Free pregnancy checkup  

### 🔹 Child & Vaccination
- Child health  
- Child care  
- Child vaccination  
- Baby vaccination  
- Vaccination schedule  
- Free child vaccination  

### 🔹 Health Issues
- I have fever  
- Fever treatment  
- Cold and cough  
- Headache  
- Stomach pain  
- Health emergency  
- Free treatment scheme  

### 🔹 Government Schemes
- Ayushman Bharat  
- What is Ayushman Bharat  
- Free treatment under Ayushman  
- Health card  
- PM Awas Yojana  
- Housing scheme  
- Government housing help  

### 🔹 Documents & Certificates
- Ration card  
- Ration card kaise banaye  
- Income certificate  
- Income certificate apply  
- Birth certificate  
- Birth certificate apply  
- Aadhaar card  
- Aadhaar update  
- Voter ID  
- Voter ID apply  

### 🔹 Pension & Senior Citizens
- Old age pension  
- Pension scheme  
- Senior citizen help  
- Government pension  

### 🔹 General
- Hello  
- Hi  
- Namaste  
- Help  
- What can you do  

> 📝 Note:  
> The system is **keyword-based** and optimized for **low bandwidth environments**.  
> If a question is not recognized, the app safely guides the user to supported services.

---

## 🌟 Overview

**AwaazSetu** is a **voice-first digital assistant** built to make **government services, healthcare guidance, and emergency information** accessible to everyone — especially **rural and non-tech users**.

Instead of navigating complex websites or typing long queries, users can simply **speak in Hindi or English** and receive **clear, spoken responses**.

> 🗣️ *If you can speak, you can access services.*

---

## ❗ Problem Statement

In rural and semi-urban India, millions of people face challenges such as:

- ❌ Low digital literacy  
- ❌ English-heavy government portals  
- ❌ Complex forms and confusing UIs  
- ❌ Difficulty typing on smartphones  

As a result, **essential schemes and healthcare guidance remain inaccessible** to the people who need them the most.

---

## 💡 Why Voice-First for India?

- 🧠 **Natural Interaction** – Speaking is easier than typing or navigating menus  
- 🌐 **Language Inclusion** – Supports Hindi and English  
- ⚡ **Low Friction** – No forms, no learning curve  
- 🤝 **Trust & Familiarity** – Hearing responses in one’s own language builds confidence  
- 📱 **Mobile-Friendly** – Designed for low-bandwidth environments  

---

## 🧭 How AwaazSetu Works

1️⃣ **User Speaks**  
Tap the microphone and ask a question in Hindi or English.

2️⃣ **Intent Detection**  
The backend analyzes the spoken or typed query using keyword-based intent detection.

3️⃣ **Knowledge Retrieval**  
A curated, multilingual **Firebase database** is queried for verified responses.

4️⃣ **Voice Response**  
The answer is shown on screen **and read aloud** using browser-based text-to-speech.

---

## 🎤 What Can You Say? (Voice Commands)

### 👋 Greetings
- “Hi”
- “Hello”
- “Namaste”
- “नमस्ते”
- “कैसे हो”

---

### 🏛️ Government Services
- “What is Ayushman Bharat?”
- “How to apply for ration card?”
- “राशन कार्ड कैसे बनवाएं?”
- “पेंशन की जानकारी”
- “Aadhaar update kaise kare”

---

### 🏥 Healthcare Guidance
- “I have fever”
- “Cough and cold”
- “पेट दर्द”
- “Vaccination information”
- “गर्भावस्था से जुड़ी जानकारी”

---

### 🚨 Emergency & Safety
- “Emergency number”
- “Police number”
- “Ambulance number”
- “इमरजेंसी नंबर बताओ”
- “पुलिस का नंबर क्या है”

📞 Provides verified Indian emergency numbers like **112, 108, 101, 1098**.

---

### ℹ️ Help & Guidance
- “Help”
- “What can you do?”
- “यह कैसे काम करता है?”
- “मदद”

---

## 🛠️ Tech Stack

### 🔧 Backend
- **Python Flask**
- Keyword-based intent detection
- REST API (`/api/query`)

### 🎨 Frontend
- HTML5, CSS3, Vanilla JavaScript
- Voice Input: Web Speech API
- Audio Output: SpeechSynthesis API
- Mobile-first, low-distraction UI

### 🗄️ Database
- **Firebase Firestore**
- Curated multilingual responses
- Offline / fallback support for demos

---

## 🚀 How to Run Locally

### 1️⃣ Install Dependencies
```bash
pip install -r requirements.txt
