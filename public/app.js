let currentLanguage = 'en';
let recognition;
let isListening = false;

const translations = {
    en: { micLabel: 'Tap to Speak', listening: 'Listening...', status: 'Bridge Active' },
    hi: { micLabel: 'बोलने के लिए टैप करें', listening: 'सुन रहा हूँ...', status: 'ब्रिज सक्रिय है' }
};

// --- VOICE OUTPUT ENGINE (FIXED) ---
function speakResponse(text) {
    if (!window.speechSynthesis) return;

    // CRITICAL: Clear the queue to unblock the voice engine
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    
    // Set natural rate
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Small delay to ensure the browser has cleared the hardware queue
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 100);
}

// --- SIDEBAR HISTORY ---
function addToHistory(text) {
    const container = document.getElementById('history-list');
    if (!container) return;
    
    const item = document.createElement('div');
    item.style = "background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; font-size: 0.8rem; margin-top: 10px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8;";
    item.textContent = text.length > 20 ? text.substring(0, 20) + "..." : text;
    
    item.onclick = () => {
        document.getElementById('user-input').value = text;
        submitQuery();
    };
    container.prepend(item);
}

// --- SPEECH RECOGNITION ---
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.onstart = () => {
        isListening = true;
        document.getElementById('mic-label').textContent = translations[currentLanguage].listening;
        document.querySelector('.inner-circle').style.boxShadow = '0 0 60px #4f46e5';
    };
    recognition.onresult = (e) => {
        document.getElementById('user-input').value = e.results[0][0].transcript;
    };
    recognition.onend = () => {
        isListening = false;
        document.getElementById('mic-label').textContent = translations[currentLanguage].micLabel;
        document.querySelector('.inner-circle').style.boxShadow = '0 0 40px rgba(79, 70, 229, 0.4)';
        if (document.getElementById('user-input').value) submitQuery();
    };
}

// --- API COMMUNICATION ---
async function submitQuery() {
    const text = document.getElementById('user-input').value;
    if (!text) return;

    addToHistory(text);

    try {
        const res = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language: currentLanguage })
        });
        const data = await res.json();
        
        // Update UI with response
        const responseBox = document.getElementById('response-text');
        if (responseBox) {
            responseBox.textContent = data.response;
            document.getElementById('response-section').style.display = 'block';
        }
        
        // Trigger the Fixed Voice Engine
        speakResponse(data.response);
    } catch (e) {
        console.error("Connection Error:", e);
    }
}

// --- EVENT LISTENERS ---
document.getElementById('mic-button').onclick = () => {
    if (!recognition) return alert("Use Chrome for voice features");
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    isListening ? recognition.stop() : recognition.start();
};

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLanguage = btn.dataset.lang;
        document.getElementById('status-text').textContent = translations[currentLanguage].status;
        document.getElementById('mic-label').textContent = translations[currentLanguage].micLabel;
    };
});

document.getElementById('pause-btn').onclick = () => {
    window.speechSynthesis.cancel();
    if (recognition) recognition.stop();
};
