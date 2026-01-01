let currentLanguage = 'en';
let recognition;
let currentPage = 1;
const itemsPerPage = 8;

const UI_TEXT = {
    en: { 
        home: "Home", history: "History", recent: "RECENT QUERIES", 
        status: "Bridge Active", tap: "Tap to Speak", stop: "Stop Listening", 
        try: "TRY ASKING", listening: "Listening...", clear: "Clear History" 
    },
    hi: { 
        home: "मुख्य", history: "इतिहास", recent: "हाल के प्रश्न", 
        status: "ब्रिज सक्रिय है", tap: "बोलने के लिए टैप करें", stop: "सुनना बंद करें", 
        try: "पूछ कर देखें", listening: "सुन रहा हूँ...", clear: "इतिहास साफ़ करें" 
    }
};

const PROMPTS = {
    en: ["Hi", "Help", "Ayushman Bharat", "Ration Card", "PM Kisan", "Hospitals", "Police 100", "Ambulance 108", "Apply Card", "Benefits", "Farmer Info", "Emergency", "Health ID", "Contact", "Status"],
    hi: ["नमस्ते", "मदद", "आयुष्मान भारत", "राशन कार्ड", "पीएम किसान", "अस्पताल", "पुलिस १००", "एम्बुलेंस १०८", "आवेदन", "फायदे", "किसान सूचना", "आपातकाल", "हेल्थ कार्ड", "संपर्क", "स्थिति"]
};

// --- MIC & SPEECH RECOGNITION LOGIC ---
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => { 
        // Triggers the CSS pulse animation
        const micContainer = document.getElementById('mic-container');
        if (micContainer) micContainer.classList.add('pulse-active');
        
        const micLabel = document.getElementById('mic-label');
        if (micLabel) micLabel.textContent = UI_TEXT[currentLanguage].listening;
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const userInput = document.getElementById('user-input');
        if (userInput) userInput.value = transcript;
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        stopMicUI();
    };

    recognition.onend = () => { 
        stopMicUI();
        const userInput = document.getElementById('user-input');
        if (userInput && userInput.value) submitQuery(); 
    };
}

function stopMicUI() {
    const micContainer = document.getElementById('mic-container');
    if (micContainer) micContainer.classList.remove('pulse-active');
    
    const micLabel = document.getElementById('mic-label');
    if (micLabel) micLabel.textContent = UI_TEXT[currentLanguage].tap;
}

// --- CORE FUNCTIONS ---
function updateFullUI() {
    const t = UI_TEXT[currentLanguage];
    const elements = {
        'nav-home': t.home, 'nav-hist': t.history, 'side-recent': t.recent,
        'status-text': t.status, 'mic-label': t.tap, 'pause-btn': t.stop, 'grid-label': t.try
    };
    for (const [id, text] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
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
            const input = document.getElementById('user-input');
            if (input) input.value = text; 
            submitQuery(); 
        };
        grid.appendChild(chip);
    });
}

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
    } catch (e) { console.error("Sidebar Error:", e); }
}

async function submitQuery() {
    const userInput = document.getElementById('user-input');
    if (!userInput || !userInput.value) return;
    
    const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInput.value, language: currentLanguage })
    });
    const data = await res.json();
    
    const respBox = document.getElementById('response-section');
    const respText = document.getElementById('response-text');
    if (respBox && respText) {
        respText.textContent = data.response;
        respBox.style.display = 'block';
    }
    
    // Text-to-Speech
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(data.response);
    utt.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utt);
    
    refreshRecentQueries();
    userInput.value = ""; 
}

// --- INITIALIZATION ---
window.onload = () => {
    updateFullUI();
    refreshRecentQueries();
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.lang;
            updateFullUI();
        };
    });

    const micBtn = document.getElementById('mic-button');
    if (micBtn) micBtn.onclick = () => { if (recognition) recognition.start(); };

    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.onclick = () => { 
        if (recognition) recognition.stop(); 
        window.speechSynthesis.cancel(); 
    };
};
