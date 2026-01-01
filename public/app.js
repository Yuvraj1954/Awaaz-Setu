let currentLanguage = 'en';
let recognition;
let isListening = false;

const translations = {
    en: { title: 'AwaazSetu', micLabel: 'Ready to Listen', listening: 'Listening...', insights: 'Assistant Insights' },
    hi: { title: 'आवाज़सेतु', micLabel: 'सुनने के लिए तैयार', listening: 'सुन रहा हूँ...', insights: 'सहायक अंतर्दृष्टि' }
};

// --- LANGUAGE SWITCHER ---
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLanguage = btn.dataset.lang;
        
        // Update Text
        document.getElementById('app-title').textContent = translations[currentLanguage].title;
        document.getElementById('mic-label').textContent = translations[currentLanguage].micLabel;
        
        if (recognition) {
            recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        }
    });
});

// --- SPEECH ENGINE ---
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.onstart = () => { 
        isListening = true; 
        document.getElementById('mic-label').textContent = translations[currentLanguage].listening;
        document.querySelector('.inner-circle').style.background = '#10b981';
    };
    recognition.onresult = (e) => { 
        document.getElementById('user-input').value = e.results[0][0].transcript; 
    };
    recognition.onend = () => { 
        isListening = false; 
        document.querySelector('.inner-circle').style.background = '#4f46e5';
        document.getElementById('mic-label').textContent = translations[currentLanguage].micLabel;
        if (document.getElementById('user-input').value) submitQuery();
    };
}

// --- SUBMIT LOGIC ---
async function submitQuery() {
    const text = document.getElementById('user-input').value;
    if (!text) return;

    document.getElementById('loading').style.display = 'flex';
    addToHistory(text);

    try {
        const res = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language: currentLanguage })
        });
        const data = await res.json();
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('response-text').textContent = data.response;
        document.getElementById('response-section').style.display = 'block';
        
        speakText(data.response, currentLanguage);
    } catch (e) {
        document.getElementById('loading').style.display = 'none';
    }
}

function speakText(text, lang) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(u);
}

function addToHistory(text) {
    const container = document.getElementById('history-list');
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = text.length > 30 ? text.substring(0, 30) + "..." : text;
    item.onclick = () => { document.getElementById('user-input').value = text; submitQuery(); };
    container.prepend(item);
}

document.getElementById('mic-button').onclick = () => {
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    isListening ? recognition.stop() : recognition.start();
};

document.getElementById('pause-btn').onclick = () => {
    if (recognition) recognition.stop();
    window.speechSynthesis.cancel();
};
