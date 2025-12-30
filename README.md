# AwaazSetu - Voice Bridge to Services

## Overview
AwaazSetu is a voice-first platform designed to empower rural users in India by providing seamless access to essential government and healthcare information. By bridging the gap between complex digital services and local languages, it ensures that technology serves those who need it most.

## Problem Statement
In rural India, millions of people struggle to access government schemes and healthcare guidance due to digital literacy barriers, complex website interfaces, and language gaps. Traditional search engines and portals are often too complicated for users who are more comfortable with spoken language than typing.

## Why Voice-First for India?
- **Digital Literacy**: Many users find speaking more natural than navigating complex menus or typing.
- **Local Languages**: Voice allows for better accessibility in local dialects and languages like Hindi.
- **Low Friction**: Eliminates the need for learning complex UI patterns.
- **Trust**: Hearing information in a familiar language and tone builds trust in the information provided.

## How AwaazSetu Works
AwaazSetu acts as an intelligent bridge:
1. **Selection**: User chooses the service (Government or Healthcare) and their preferred language.
2. **Interaction**: User taps the microphone to ask a question in natural language.
3. **Intent Detection**: The backend analyzes the spoken (or typed) input to identify the specific need (e.g., "ration card" or "fever").
4. **Knowledge Retrieval**: The system fetches the most relevant, pre-verified information from its local database.
5. **Guidance**: The information is presented in a short, easy-to-understand, spoken-style format.

## Tech Stack
- **Backend**: Python Flask
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Inter font, Font Awesome)
- **Database**: PostgreSQL (with SQLAlchemy) for persistent service information
- **Styling**: Modern CSS with CSS Variables and responsive design

## How to Run Locally
1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
2. **Setup Database**:
   - Ensure you have a PostgreSQL database available.
   - Set the `DATABASE_URL` environment variable.
3. **Run the Application**:
   ```bash
   python app.py
   ```
4. **Access the App**: Open your browser and navigate to `http://localhost:5000`.

## Future Scope
- **IVR Integration**: Enable users to call a phone number and get information over a standard voice call.
- **WhatsApp Voice Bot**: Integrate with WhatsApp to allow users to send voice notes and receive audio guidance.
- **Government API Integration**: Connect directly to official portals for real-time status tracking (e.g., checking ration card status).
- **Expanded Dialects**: Add support for more regional Indian languages and local dialects.
- **Voice-to-Voice**: Implement Text-to-Speech (TTS) to read out the responses automatically.
