let currentLanguage = 'en';
let recognition;
let isListening = false;
const translations = { 
    en: { micLabel: 'Tap to Speak', listening: 'Listening...', status: 'Bridge Active' }, 
    hi: { micLabel: 'बोलने के लिए टैप करें', listening: 'सुन रहा हूँ...', status: 'ब्रिज सक्रिय है' } 
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

// Fetch history from MongoDB
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
        div.style = "padding: 10px; font-size: 0.8rem; margin-top: 8px; cursor: pointer; color: #94a3b8; border-radius: 10px; background: rgba(255,255,255,0.05); transition: 0.2s; width: 90%; text-align: center;";
        div.textContent = item.text.length > 20 ? item.text.substring(0, 20) + "..." : item.text;
        div.onclick = () => { document.getElementById('user-input').value = item.text; submitQuery(); };
        container.appendChild(div);
    });
}

// --- FRIENDLY VOICE ENGINE ---
function speakResponse(text, lang) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get all available voices on the device
    const voices = window.speechSynthesis.getVoices();
    
    if (lang === 'hi') {
        utterance.lang = 'hi-IN';
        // Look for Google Hindi or natural sounding local voices
        utterance.voice = voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) || voices.find(v => v.lang === 'hi-IN');
        utterance.rate = 0.9;  // Slightly slower for clarity
        utterance.pitch = 1.0; // Natural pitch
    } else {
        utterance.lang = 'en-IN';
        // Look for Google English (India) or Microsoft natural voices
        utterance.voice = voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.includes('en'));
        utterance.rate = 0.95; // Just a tiny bit slower to avoid "robotic" speed
        utterance.pitch = 1.1;  // Slightly higher pitch sounds more "friendly/helpful"
    }

    window.speechSynthesis.speak(utterance);
}

window.onload = () => { 
    refreshSidebar(); 
    // Warm up voices (Some browsers need this to load the voice list)
    window.speechSynthesis.getVoices();
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

        // Trigger the improved friendly voice
        speakResponse(data.response, currentLanguage);

        refreshSidebar();
    } catch (e) { 
        console.error(e); 
        setUiState(false); 
    }
}

document.getElementById('mic-button').onclick = () => { 
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN'; 
    isListening ? recognition.stop() : recognition.start(); 
};

document.getElementById('history-btn').onclick = () => { window.location.href = 'history.html'; };

document.querySelectorAll('.lang-btn').forEach(btn => { 
    btn.onclick = () => { 
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); 
        btn.classList.add('active'); 
        currentLanguage = btn.dataset.lang; 
    }; 
});

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
