let currentLanguage = 'en';
let recognition;
let currentPage = 1;
const itemsPerPage = 7;

const UI_TEXT = {
    en: { 
        home: "Home", history: "History", recent: "RECENT QUERIES", 
        status: "Bridge Active", tap: "Tap to Speak", stop: "Stop Listening", 
        try: "TRY ASKING", listening: "Listening...", clear: "Clear History" 
    },
    hi: { 
        home: "मुख्य", history: "इतिहास", recent: "हाल के प्रश्न", 
        status: "ब्रिज सक्रिय है", tap: "बोलने के लिए टैप करें", stop: "सुनना बंद करें", 
        try: "पूछ कर देखें", listening: "सुन रहा हूँ...", clear: "इतिहास साफ़ करें" 
    }
};

const PROMPTS = {
    en: ["Hi", "Help", "Ayushman Bharat", "Ration Card", "PM Kisan", "Hospitals", "Police 100", "Ambulance 108", "Apply Card", "Benefits", "Farmer Info", "Emergency", "Health ID", "Contact", "Status"],
    hi: ["नमस्ते", "मदद", "आयुष्मान भारत", "राशन कार्ड", "पीएम किसान", "अस्पताल", "पुलिस १००", "एम्बुलेंस १०८", "आवेदन", "फायदे", "किसान सूचना", "आपातकाल", "हेल्थ कार्ड", "संपर्क", "स्थिति"]
};

// --- VOICE SYNTHESIS ---
function speakResponse(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
}

// --- UI TRANSLATION & CENTERING UPDATES ---
function updateFullUI() {
    const t = UI_TEXT[currentLanguage];
    if (document.getElementById('nav-home')) document.getElementById('nav-home').textContent = t.home;
    if (document.getElementById('nav-hist')) document.getElementById('nav-hist').textContent = t.history;
    if (document.getElementById('side-recent')) document.getElementById('side-recent').textContent = t.recent;
    if (document.getElementById('status-text')) document.getElementById('status-text').textContent = t.status;
    if (document.getElementById('mic-label')) document.getElementById('mic-label').textContent = t.tap;
    if (document.getElementById('pause-btn')) document.getElementById('pause-btn').textContent = t.stop;
    if (document.getElementById('grid-label')) document.getElementById('grid-label').textContent = t.try;
    renderGrid();
}

function renderGrid() {
    const grid = document.getElementById('command-grid');
    if (!grid) return;
    grid.innerHTML = "";
    PROMPTS[currentLanguage].forEach(text => {
        const chip = document.createElement('div');
        chip.className = "suggest-chip";
        chip.textContent = text;
        chip.onclick = () => { 
            document.getElementById('user-input').value = text; 
            submitQuery(); 
        };
        grid.appendChild(chip);
    });
}

// --- SIDEBAR RECENT QUERIES (LIMIT 5) ---
async function refreshRecentQueries() {
    try {
        const res = await fetch('/api/history');
        const data = await res.json();
        const container = document.getElementById('history-list');
        if (!container) return;
        container.innerHTML = data.slice(0, 5).map(item => `
            <div class="history-item" onclick="document.getElementById('user-input').value='${item.text}'; submitQuery();">
                ${item.text.length > 20 ? item.text.substring(0, 20) + '...' : item.text}
            </div>
        `).join('');
    } catch (e) { console.error("Sidebar update failed", e); }
}

// --- SUBMIT QUERY ---
async function submitQuery() {
    const text = document.getElementById('user-input').value;
    if (!text) return;
    const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: currentLanguage })
    });
    const data = await res.json();
    const respSection = document.getElementById('response-section');
    if (respSection) {
        document.getElementById('response-text').textContent = data.response;
        respSection.style.display = 'block';
    }
    speakResponse(data.response);
    refreshRecentQueries();
}

// --- HISTORY LOGS & PAGINATION ---
async function fetchHistoryLogs() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;
    const res = await fetch('/api/history');
    const allData = await res.json();
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedData = allData.slice(start, start + itemsPerPage);
    
    tbody.innerHTML = paginatedData.map(item => `
        <tr>
            <td style="color:var(--primary); font-weight:800;">${item.time}</td>
            <td style="font-weight:600;">${item.text}</td>
            <td><span style="background:rgba(79,70,229,0.1); padding:4px 10px; border-radius:8px; color:var(--primary); font-size:0.75rem;">${item.language.toUpperCase()}</span></td>
        </tr>
    `).join('');
    
    document.getElementById('page-num').textContent = `Page ${currentPage}`;
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = (start + itemsPerPage) >= allData.length;
}

// --- CLEAR HISTORY ---
async function clearLogs() {
    if (!confirm("Clear all logs? This cannot be undone.")) return;
    try {
        const res = await fetch('/api/clear', { method: 'POST' });
        const result = await res.json();
        if (result.status === "success") {
            location.reload();
        }
    } catch (e) { console.error("Clear logs failed", e); }
}

// --- INITIALIZATION ---
window.onload = () => {
    updateFullUI();
    refreshRecentQueries();
    if (document.getElementById('history-body')) fetchHistoryLogs();

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.lang;
            updateFullUI();
        };
    });
};

// --- SPEECH RECOGNITION ---
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.onstart = () => { 
        document.getElementById('mic-container').classList.add('pulse-active');
        document.getElementById('mic-label').textContent = UI_TEXT[currentLanguage].listening;
    };
    recognition.onresult = (e) => { document.getElementById('user-input').value = e.results[0][0].transcript; };
    recognition.onend = () => { 
        document.getElementById('mic-container').classList.remove('pulse-active');
        document.getElementById('mic-label').textContent = UI_TEXT[currentLanguage].tap;
        if (document.getElementById('user-input').value) submitQuery(); 
    };
}

document.getElementById('mic-button').onclick = () => { recognition.start(); };
document.getElementById('pause-btn').onclick = () => { recognition.stop(); window.speechSynthesis.cancel(); };

if (document.getElementById('prev-btn')) {
    document.getElementById('prev-btn').onclick = () => { currentPage--; fetchHistoryLogs(); };
}
if (document.getElementById('next-btn')) {
    document.getElementById('next-btn').onclick = () => { currentPage++; fetchHistoryLogs(); };
}
