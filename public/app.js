let currentLanguage = 'en';
let recognition;
let isListening = false;
let paused = false;

const translations = {
    en: { title: 'AwaazSetu', subtitle: 'Bridge Active', tagline: 'Your voice bridge to healthcare services.', micLabel: 'Ready to Listen', listening: 'Listening...', responseTitle: 'Assistant Insights', newQuery: 'New Request' },
    hi: { title: 'आवाज़सेतु', subtitle: 'पुल सक्रिय है', tagline: 'स्वास्थ्य सेवाओं के लिए आपका आवाज़ पुल।', micLabel: 'बोलने के लिए तैयार', listening: 'सुन रहा हूँ...', responseTitle: 'सहायक अंतर्दृष्टि', newQuery: 'नया अनुरोध' }
};

// History Logic
function addToHistory(text) {
    const container = document.getElementById('history-list');
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = text;
    item.onclick = () => { document.getElementById('user-input').value = text; submitQuery(); };
    container.prepend(item);
}

// Speech Recognition Setup
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.onstart = () => { 
        isListening = true; 
        document.querySelector('.inner-circle').style.transform = 'scale(1.2)';
        document.getElementById('mic-label').textContent = translations[currentLanguage].listening;
    };
    recognition.onresult = (e) => { document.getElementById('user-input').value = e.results[0][0].transcript; };
    recognition.onend = () => {
        isListening = false;
        document.querySelector('.inner-circle').style.transform = 'scale(1)';
        document.getElementById('mic-label').textContent = translations[currentLanguage].micLabel;
        if (document.getElementById('user-input').value) submitQuery();
    };
}

async function submitQuery() {
    const text = document.getElementById('user-input').value;
    if (!text) return;
    document.getElementById('loading').style.display = 'flex';
    addToHistory(text); // Save to history

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
}

function speakText(text, lang) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(u);
}

document.getElementById('mic-button').onclick = () => { recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN'; isListening ? recognition.stop() : recognition.start(); };
document.querySelectorAll('.lang-btn').forEach(b => b.onclick = () => {
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    b.classList.add('active'); currentLanguage = b.dataset.lang;
    document.getElementById('app-title').textContent = translations[currentLanguage].title;
});
