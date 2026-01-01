let currentLanguage = 'en';
let recognition;
let isListening = false;

// History & Storage Logic
function saveToPersistentLog(text) {
    let fullHistory = JSON.parse(localStorage.getItem('awaazSetu_FullHistory') || '[]');
    fullHistory.unshift({ text, lang: currentLanguage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    localStorage.setItem('awaazSetu_FullHistory', JSON.stringify(fullHistory));
    updateSidebarUI(fullHistory.slice(0, 5));
}

function updateSidebarUI(items) {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.innerHTML = ""; 
    items.forEach(item => {
        const div = document.createElement('div');
        div.style = "background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; font-size: 0.8rem; margin-top: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-weight: 600;";
        div.textContent = item.text.length > 20 ? item.text.substring(0, 20) + "..." : item.text;
        div.onclick = () => { document.getElementById('user-input').value = item.text; submitQuery(); };
        container.appendChild(div);
    });
}

// Voice Engine with Unblock
function speakResponse(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    setTimeout(() => { window.speechSynthesis.speak(u); }, 100);
}

async function submitQuery() {
    const text = document.getElementById('user-input').value;
    if (!text) return;
    saveToPersistentLog(text);
    try {
        const res = await fetch('/api/query', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ text, language: currentLanguage }) 
        });
        const data = await res.json();
        document.getElementById('response-text').textContent = data.response;
        document.getElementById('response-section').style.display = 'block';
        speakResponse(data.response);
    } catch (e) { console.error(e); }
}

// Event Listeners
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.onstart = () => { isListening = true; };
    recognition.onresult = (e) => { document.getElementById('user-input').value = e.results[0][0].transcript; };
    recognition.onend = () => { isListening = false; if (document.getElementById('user-input').value) submitQuery(); };
}

document.getElementById('mic-button').onclick = () => { 
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN'; 
    isListening ? recognition.stop() : recognition.start(); 
};
document.getElementById('history-btn').onclick = () => { window.location.href = 'history.html'; };
document.querySelectorAll('.lang-btn').forEach(btn => { btn.onclick = () => { 
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); 
    currentLanguage = btn.dataset.lang; 
}; });
document.getElementById('new-query-btn').onclick = () => { document.getElementById('response-section').style.display = 'none'; document.getElementById('user-input').value = ''; };
document.getElementById('pause-btn').onclick = () => { window.speechSynthesis.cancel(); if (recognition) recognition.stop(); };

window.onload = () => { updateSidebarUI(JSON.parse(localStorage.getItem('awaazSetu_FullHistory') || '[]').slice(0, 5)); };
