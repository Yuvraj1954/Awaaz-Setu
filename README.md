# 🎙️ AwaazSetu & Sarthi
### 🌏 *Empowering Bharat: Bilingual Voice Bridge for Essential Services*

**AwaazSetu** (Web) and **Sarthi** (Android) are voice-first digital assistants designed to bridge the digital divide. By converting complex government and healthcare information into simple spoken dialogue, we empower rural and non-tech-savvy users to access their rights—even without a stable internet connection.

---

## 📱 Sarthi: The Offline-First Android Evolution
**Sarthi** is the native flagship implementation of this project, built to solve the "Connectivity Gap" in rural India.

* **🚀 1,000+ Native Commands:** While web browsers have speech limits, Sarthi uses a native Android engine to support thousands of command variations in Hindi and English.
* **🔋 True Offline Access:** Core emergency data, health tips, and scheme information are stored locally. No signal? No problem.
* **🔄 Intelligent Synchronization:** Designed for intermittent connectivity. Sarthi queues user data and automatically syncs with the cloud the moment a network connection is momentarily restored.
* **⚡ Low-Bandwidth Optimization:** Engineered to run on 2G networks and budget-friendly Android devices.

---

## 💻 AwaazSetu: The Web Gateway
A lightweight, instant-access platform for users on any device.

🚨 **Note:** For the best experience, use **Google Chrome** and allow microphone access. Due to browser limitations, the web version supports a curated set of high-priority keywords.

🔗 **LIVE WEB DEMO:** [https://awaaz-setu-2.onrender.com/](https://awaaz-setu-2.onrender.com/)

---

## 🎙️ Bilingual Voice Support (Hindi & English)
Both platforms use a **keyword-based intent system** to ensure 100% accuracy and safety, eliminating "AI hallucinations."

| Category | English Commands | Hindi Commands |
| :--- | :--- | :--- |
| **🚨 Emergency** | Call Police, Ambulance, Emergency No. | पुलिस नंबर, एम्बुलेंस, इमरजेंसी सहायता |
| **🤰 Pregnancy** | Pregnancy care, Govt schemes | गर्भावस्था मदद, सरकारी प्रेगनेंसी स्कीम |
| **🏥 Health** | Fever treatment, Ayushman Bharat | बुखार का इलाज, आयुष्मान भारत योजना |
| **📄 Documents** | Ration card, Aadhaar update, Voter ID | राशन कार्ड, आधार अपडेट, वोटर आईडी |
| **👵 Pension** | Old age pension, Senior citizen help | बुढ़ापा पेंशन, पेंशन योजना की जानकारी |
| **👋 General** | Hello, Help, What can you do? | नमस्ते, मदद चाहिए, आप क्या कर सकते हैं? |

---

## 💡 The Problem & Our Solution

### **The Problem**
Millions in rural India face a "Triple Barrier":
1.  **Literacy Barrier:** Complex, text-heavy government portals.
2.  **Language Barrier:** Information primarily in English.
3.  **Connectivity Barrier:** Unstable or non-existent internet (The "Data-Dark" zones).

### **The Solution**
* **Voice-First:** If you can speak, you can access services.
* **Bilingual:** Native support for Hindi, English, and "Hinglish."
* **Resilient:** **Sarthi** stays functional when the internet vanishes, ensuring "No Signal" never means "No Service."

---

## 🛠️ Tech Stack

### **Mobile (Sarthi APK)**
- **Native Android (Java/Kotlin):** For high-performance on-device processing.
- **SQLite / Room Database:** For robust offline data persistence.
- **WorkManager API:** For intelligent background data synchronization.
- **Android SpeechRecognizer:** High-accuracy local voice processing.

### **Web (AwaazSetu)**
- **Python Flask:** Lightweight backend API.
- **Web Speech & SpeechSynthesis API:** For browser-based voice interaction.
- **Firebase Firestore:** Real-time multilingual database.

---

## 🚀 How to Get Started

### **1. Install Sarthi (Android)**
* Download `Sarthi.apk` from the [Releases](#) folder.
* Enable "Install from Unknown Sources" in your Android settings.
* Open the app and start speaking—**works 100% offline.**

### **2. Run AwaazSetu (Web) Locally**
```bash
# Clone the repository
git clone [https://github.com/your-repo/awaazsetu.git](https://github.com/your-repo/awaazsetu.git)

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
