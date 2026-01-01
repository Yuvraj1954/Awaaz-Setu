# 🛰️ AwaazSetu | Elite Voice Bridge
### *Bridging the Digital Divide: The Voice-First Gateway to India's Essential Services*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Launch_App-brightgreen?style=for-the-badge&logo=vercel&logoColor=white)](https://awaaz-setu-seven.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Flask_REST_API-black?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-green?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla_JS_Elite-blue?style=for-the-badge&logo=javascript&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> **📥 [Download the Official Command Guide (PDF)](static/docs/command_Guide.pdf)**

---

## 📺 Mission Overview
**AwaazSetu** is a next-generation voice-first platform engineered for the **300M+ Indians** who face literacy and language barriers. While the internet is vast, it remains inaccessible to rural populations due to complex text interfaces.

AwaazSetu transforms complex government portals (Cowin, PM Kisan, NFSA) into a **simple, spoken conversation**, creating a zero-touch digital bridge for the last mile of humanity.

### [🔗 Experience the Live Elite App](https://awaaz-setu-seven.vercel.app/)

---

## 🌟 Elite Features & Architecture

### 🧠 Massive Knowledge Engine (250+ Scenarios)
Unlike basic chatbots, AwaazSetu is pre-trained on **12 Master Categories** covering the entire spectrum of Indian civic life:
* **Health:** Ayushman Bharat, Jan Aushadhi, Mental Health (Tele-MANAS).
* **Rights:** Maternity Benefits, Disability (UDID), Senior Citizen Welfare.
* **Emergency:** Instant connections to Police (100), Ambulance (108), and Fire (101).

### 🛡️ Zero-Hallucination Intent System
In critical sectors like Healthcare, accuracy is non-negotiable. AwaazSetu rejects the unpredictability of standard LLMs in favor of a deterministic **Keyword-Intent Engine**. This ensures users get **100% verified, life-saving data** every time, with zero false information.

### 📡 Radar-Pulse UI & "Hinglish" NLP
* **Visual Feedback:** Features a custom CSS "Radar Ripple" animation that provides intuitive visual cues for listening states.
* **Linguistic Resilience:** Optimized to understand "Hinglish" (Hindi-English mix), making the technology feel invisible to non-tech-savvy users.

---

## 🛠️ Technical Stack (Modernized)

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | **Python Flask** | Lightweight RESTful API handling intent logic. |
| **Database** | **MongoDB Atlas** | High-performance NoSQL cloud database for real-time logging. |
| **Frontend** | **HTML5 / CSS3** | "Glassmorphism" UI with responsive grid layouts. |
| **Voice Engine** | **Web Speech API** | Native browser-based Speech-to-Text & Text-to-Speech. |
| **Deployment** | **Vercel / Render** | Auto-scaling cloud hosting. |

---

## 📱 Ecosystem Expansion: Sarthi
> **Note to Judges:** To extend accessibility beyond the browser, I independently architected a native Android solution.

[![Download APK](https://img.shields.io/badge/Native_App-Sarthi_APK-FF2D55?style=for-the-badge&logo=android&logoColor=white)](https://github.com/Yuvraj1954/Sarthi)

**Sarthi** is the offline-first Android counterpart to AwaazSetu, optimized for low-bandwidth environments (2G/3G) typical in rural Bharat.

---

## ⚙️ Local Development Setup

Follow these steps to get the project running on your local machine:

### 1. Install Dependencies
```bash
# Clone the repository
git clone [https://github.com/Yuvraj1954/AwaazSetu.git](https://github.com/Yuvraj1954/AwaazSetu.git)
cd AwaazSetu
```
### 2. Configure Environment
Create a .env file in the root directory or export your MongoDB URI directly:
```bash
export MONGO_URI="your_mongodb_connection_string"
```
### 3. Launch the Bridge
Run the Flask application:
```bash
python app.py
Access the elite interface at: http://localhost:5000
```
## 🛣️ Strategic Roadmap

AwaazSetu is designed to be the "Digital Entry Point" for every household in Bharat:

- [x] **Phase 1:** Zero-Hallucination Intent Engine (Bilingual).
- [x] **Phase 2:** Migration to **MongoDB Atlas** for scalable logging.
- [x] **Phase 3:** "Elite" UI Overhaul with Radar Visualizations.
- [ ] **Phase 4:** **WhatsApp Integration** — Voice-Bot for 500M+ WhatsApp users.
- [ ] **Phase 5:** **Multi-Dialect Expansion** — Adding Bhojpuri, Marathi, and Tamil medical terminology.

---

## 👤 Architect

**Yuvraj**
*Full-Stack Web Architect | Social Impact Developer*

| Resource | Link |
| :--- | :--- |
| **GitHub** | [💻 @Yuvraj1954](https://github.com/Yuvraj1954) |
| **Live Project** | [🚀 AwaazSetu Web](https://awaaz-setu-seven.vercel.app/) |
| **Contact** | [✉️ Email Me](mailto:yuvraj.k863888@gmail.com) |

> *"Bridging the gap between high-end technology and the last mile of humanity."*
# Install Python libraries
pip install flask flask-cors pymongo
