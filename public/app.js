/*********************************
 GLOBAL STATE
**********************************/
let currentLanguage = 'en';
let currentService = 'auto';
let recognition;
let isListening = false;
let currentUtterance = null;
let paused = false;

/*********************************
 TRANSLATIONS
**********************************/
const translations = {
    en: {
        title: 'AwaazSetu',
        subtitle: 'Your Voice Bridge to Services',
        tagline: 'Speak in Hindi or English to get help with government and healthcare services.',
        micLabel: 'Tap & Speak',
        listening: 'Listening...',
        tryAsking: 'Try asking:',
        inputLabel: 'How can we help you?',
        inputPlaceholder: 'Type your question here...',
        submit: 'Ask Question',
        cancel: 'Cancel',
        responseTitle: 'Response',
        newQuery: 'Ask Another Question',
        loading: 'Finding information...'
    },
    hi: {
        title: 'आवाज़सेतु',
        subtitle: 'सेवाओं के लिए आपका आवाज़ पुल',
        tagline: 'सरकारी और स्वास्थ्य सेवाओं में मदद के लिए हिंदी या अंग्रेजी में बोलें।',
        micLabel: 'बोलने के लिए टैप करें',
        listening: 'सुन रहा हूँ...',
        tryAsking: 'पूछने का प्रयास करें:',
        inputLabel: 'हम आपकी कैसे मदद कर सकते हैं?',
        inputPlaceholder: 'अपना सवाल यहाँ लिखें...',
        submit: 'सवाल पूछें',
        cancel: 'रद्द करें',
        responseTitle: 'जवाब',
        newQuery: 'दूसरा सवाल पूछें',
        loading: 'जानकारी ढूंढ रहे हैं...'
    }
};

/*********************************
 SPEECH RECOGNITION
**********************************/
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        if (paused) return;
        isListening = true;
        document.querySelector('.mic-circle').style.background = '#ef4444';
        document.getElementById('mic-label').textContent =
            translations[currentLanguage].listening;
    };

    recognition.onresult = (event) => {
        if (paused) return;
        document.getElementById('user-input').value =
            event.results[0][0].transcript;
    };

    recognition.onend = () => {
        stopListening();
        if (paused) return;
        const text = document.getElementById('user-input').value.trim();
        if (text) submitQuery();
    };

    recognition.onerror = () => stopListening();
}

function stopListening() {
    isListening = false;
    document.querySelector('.mic-circle').style.background = 'var(--primary)';
    document.getElementById('mic-label').textContent =
        translations[currentLanguage].micLabel;
}

/*********************************
 TEXT TO SPEECH
**********************************/
function speakText(text, language) {
    if (paused) return;
    if (!('speechSynthesis' in window)) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.1;
    speechSynthesis.speak(utterance);
}

/*********************************
 LANGUAGE UPDATE
**********************************/
function updateLanguage() {
    const t = translations[currentLanguage];
    document.getElementById('app-title').textContent = t.title;
    document.getElementById('app-subtitle').textContent = t.subtitle;
    document.getElementById('app-tagline').textContent = t.tagline;
    document.getElementById('mic-label').textContent = t.micLabel;
    document.getElementById('try-asking-label').textContent = t.tryAsking;
    document.getElementById('input-label').textContent = t.inputLabel;
    document.getElementById('user-input').placeholder = t.inputPlaceholder;
    document.getElementById('submit-text').textContent = t.submit;
    document.getElementById('cancel-text').textContent = t.cancel;
    document.getElementById('response-title').textContent = t.responseTitle;
    document.getElementById('new-query-text').textContent = t.newQuery;
    document.getElementById('loading-text').textContent = t.loading;

    if (recognition) {
        recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    }
}

/*********************************
 MIC BUTTON
**********************************/
document.getElementById('mic-button').addEventListener('click', () => {
    if (paused) return;
    if (!recognition) return alert('Please use Chrome for voice input.');
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    isListening ? recognition.stop() : recognition.start();
});

/*********************************
 SUBMIT QUERY
**********************************/
async function submitQuery() {
    if (paused) return;

    const text = document.getElementById('user-input').value.trim();
    if (!text) return;

    document.getElementById('loading').style.display = 'flex';

    try {
        const res = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                service: currentService,
                language: currentLanguage
            })
        });

        const data = await res.json();
        document.getElementById('loading').style.display = 'none';
        document.getElementById('response-text').textContent = data.response;
        document.getElementById('response-section').style.display = 'block';
        speakText(data.response, currentLanguage);

    } catch {
        document.getElementById('loading').style.display = 'none';
        alert('Server error. Please try again.');
    }
}

/*********************************
 FORCE STOP (PAUSE)
**********************************/
function forceStopAll() {
    paused = true;
    if (recognition && isListening) recognition.stop();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    document.getElementById('loading').style.display = 'none';
    document.getElementById('mic-label').textContent =
        translations[currentLanguage].micLabel;
}

/*********************************
 PROMPTS
**********************************/
const promptPool = [
    "नमस्ते","Hello","Emergency number","Police number","Ambulance number",
    "Hospital near me","Old age pension","Vaccination schedule","I have fever",
    "राशन कार्ड कैसे बनवाएं?","What is Ayushman Bharat?",
    "आयुष्मान भारत क्या है?","सरकारी योजना बताइए","मुझे बुखार है",
    "Pregnancy help","Child vaccination","Aadhar card apply",
    "Voter ID apply","Income certificate","Birth certificate",
    "PM Awas Yojana","Women helpline","Child helpline",
    "Government hospital","Free treatment scheme",
    "Health card","Pension scheme","Senior citizen help"
];

function loadRandomPrompts() {
    const shuffled = [...promptPool].sort(() => 0.5 - Math.random());
    document.querySelectorAll('.prompt-item').forEach((el, i) => {
        el.textContent = shuffled[i];
        el.onclick = () => {
            if (paused) return;
            document.getElementById('user-input').value = el.textContent;
            currentLanguage = /[\u0900-\u097F]/.test(el.textContent) ? 'hi' : 'en';
            updateLanguage();
            submitQuery();
        };
    });
}

/*********************************
 INIT — FIXES ALL BUTTONS
**********************************/
window.addEventListener('load', () => {

    paused = false;
    updateLanguage();
    loadRandomPrompts();

    // LANGUAGE BUTTONS
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.lang;
            updateLanguage();
        });
    });

    // REPEAT BUTTON
    const speakerBtn = document.getElementById('speaker-btn');
    if (speakerBtn) {
        speakerBtn.addEventListener('click', () => {
            const text = document.getElementById('response-text').textContent;
            if (text) speakText(text, currentLanguage);
        });
    }

    // ASK ANOTHER QUESTION
    const newQueryBtn = document.getElementById('new-query-btn');
    if (newQueryBtn) {
        newQueryBtn.addEventListener('click', () => {
            if ('speechSynthesis' in window) speechSynthesis.cancel();
            document.getElementById('response-section').style.display = 'none';
            document.getElementById('user-input').value = '';
            paused = false;
        });
    }

    // PAUSE BUTTON (SAFE)
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', forceStopAll);
    }
});
