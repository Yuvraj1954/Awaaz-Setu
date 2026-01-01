let currentLanguage = 'en';
let recognition;
let isListening = false;

// UI Translations for the main dashboard
const translations = { 
    en: { 
        micLabel: 'Tap to Speak', 
        listening: 'Listening...', 
        status: 'Bridge Active',
        stopBtn: 'Stop Listening',
        askAnother: 'Ask Another',
        respHead: 'Assistant Response'
    }, 
    hi: { 
        micLabel: 'बोलने के लिए टैप करें', 
        listening: 'सुन रहा हूँ...', 
        status: 'ब्रिज सक्रिय है',
        stopBtn: 'सुनना बंद करें',
        askAnother: 'दूसरा पूछें',
        respHead: 'सहायक की प्रतिक्रिया'
    } 
};

function setUiState(listening) {
    const icon = document.getElementById('mic-icon');
    const wave = document.getElementById('waveform');
    const container = document.getElementById('mic-container');
    if (listening) { 
        icon.style.display = 'none'; 
        wave.style.display = 'flex'; 
        container.classList.add('pulse-active'); 
    } else { 
        icon.style.display = 'block'; 
        wave.style.display = 'none'; 
        container.classList.remove('pulse-active'); 
    }
}

// Update all UI text based on selected language
function updateUiLanguage() {
    const t = translations[currentLanguage];
    document.getElementById('mic-label').textContent = t.micLabel;
    document.getElementById('status-text').textContent = t.status;
    document.getElementById('pause-btn').textContent = t.stopBtn;
    document.getElementById('new-query-btn').textContent = t.askAnother;
    
    // Update response header if it exists
    const respHeadText = document.querySelector('.resp-head span');
    if (respHeadText) respHeadText.textContent = t.respHead;
}

async function refreshSidebar() {
    try {
        const res = await fetch('/api/history');
        const history = await res.json();
        updateSidebarUI(history.slice(0, 5));
    } catch (e) { console.error("History fetch failed", e); }
}

function updateSidebarUI(items) {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.innerHTML = ""; 
    items.forEach(item => {
        const div = document.createElement('div'); 
        div.style = "padding: 12px; font-size: 1rem; margin-top: 10px; cursor: pointer; color: #f8fafc; border-radius: 12px; background: rgba(255,255,255,0.08); transition: 0.2s; width: 90%; text-align: center; font-weight: 500; border: 1px solid rgba(255,255,255,0.1);";
        div.textContent = item.text.length > 25 ? item.text.substring(0, 25) + "..." : item.text;
        div.onclick = () => { document.getElementById('user-input').value = item.text; submitQuery(); };
        container.appendChild(div);
    });
}

function speakResponse(text, lang) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    if (lang === 'hi') {
        utterance.lang = 'hi-IN';
        utterance.voice = voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) || voices.find(v => v.lang === 'hi-IN');
        utterance.rate = 1.0; 
    } else {
        utterance.lang = 'en-IN';
        const indianVoice = voices.find(v => v.name.includes('Neural') && v.lang === 'en-IN') || 
                           voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) ||
                           voices.find(v => v.lang === 'en-IN');
        utterance.voice = indianVoice || voices.find(v => v.lang === 'en-GB');
        utterance.rate = 0.9; 
    }
    window.speechSynthesis.speak(utterance);
}

// Initialize logic
window.onload = () => { 
    refreshSidebar(); 
    
    // Set up language toggle listeners
    document.querySelectorAll('.lang-btn').forEach(btn => { 
        btn.onclick = () => { 
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); 
            btn.classList.add('active'); 
            currentLanguage = btn.getAttribute('data-lang'); 
            updateUiLanguage(); // Force UI update
        }; 
    });

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
};

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.onstart = () => { 
        isListening = true; 
        setUiState(true); 
        document.getElementById('mic-label').textContent = translations[currentLanguage].listening; 
    };
    recognition.onresult = (e) => { 
        document.getElementById('user-input').value = e.results[0][0].transcript; 
    };
    recognition.onend = () => { 
        isListening = false; 
        setUiState(false); 
        document.getElementById('mic-label').textContent = translations[currentLanguage].micLabel; 
        if (document.getElementById('user-input').value) submitQuery(); 
    };
}

async function submitQuery() {
    const text = document.getElementById('user-input').value;
    if (!text) return;
    try {
        const res = await fetch('/api/query', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ text, language: currentLanguage }) 
        });
        const data = await res.json();
        const responseSection = document.getElementById('response-section');
        document.getElementById('response-text').textContent = data.response;
        responseSection.style.display = 'block';
        setTimeout(() => { responseSection.scrollTop = responseSection.scrollHeight; }, 100);
        speakResponse(data.response, currentLanguage);
        refreshSidebar();
    } catch (e) { console.error(e); setUiState(false); }
}

document.getElementById('mic-button').onclick = () => { 
    if (!recognition) return alert("Speech recognition not supported.");
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN'; 
    isListening ? recognition.stop() : recognition.start(); 
};

document.getElementById('history-btn').onclick = () => { window.location.href = 'history.html'; };

document.getElementById('new-query-btn').onclick = () => { 
    document.getElementById('response-section').style.display = 'none'; 
    document.getElementById('user-input').value = ''; 
    window.speechSynthesis.cancel();
};

document.getElementById('pause-btn').onclick = () => { 
    window.speechSynthesis.cancel(); 
    if (recognition) recognition.stop(); 
    setUiState(false); 
};
