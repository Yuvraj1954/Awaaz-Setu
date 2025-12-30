# 🎙️ AwaazSetu  
### 🌏 *Voice Bridge to Essential Services for Bharat*

🚨 **IMPORTANT:**  
**Voice features work best in Google Chrome.**  
Please allow microphone access when prompted.

🔗 **LIVE DEMO:**  
👉 **https://awaaz-setu-2.onrender.com/**

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
