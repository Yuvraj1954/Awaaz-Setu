let currentLanguage = 'en';
let recognition;
let isListening = false;
let currentPage = 1;
const itemsPerPage = 10; // FIXED: Shows 10 logs per page in History

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

// --- 1. SPEECH RECOGNITION (MIC & STOP FIX) ---
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = false;

    recognition.onstart = () => { 
        isListening = true;
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
        console.error("Mic Error:", event.error);
        stopMicUI(); 
    };

    recognition.onend = () => { 
        isListening = false;
        stopMicUI();
        const userInput = document.getElementById('user-input');
        // Only submit if we actually got text and wasn't manually stopped with empty input
        if (userInput && userInput.value.trim() !== "") {
            submitQuery(); 
        }
    };
}

function startMic() {
    if (isListening) return;
    if (recognition) {
        try { recognition.start(); } 
        catch (e) { console.warn("Mic already active"); }
    }
}

// FIXED: Stop Listening Button Logic
function stopMic() {
    if (recognition) {
        recognition.stop(); // Stops recording
    }
    stopMicUI(); // Immediately resets UI
}

function stopMicUI() {
    isListening = false;
    const micContainer = document.getElementById('mic-container');
    if (micContainer) micContainer.classList.remove('pulse-active');
    
    const micLabel = document.getElementById('mic-label');
    if (micLabel) micLabel.textContent = UI_TEXT[currentLanguage].tap;
}

// --- 2. ACTIVITY LOGS (FIXED: SHOWS 10 ITEMS) ---
async function fetchHistoryLogs() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return; 

    try {
        const res = await fetch('/api/history');
        const allData = await res.json();
        
        // FIX: Slices 10 items based on itemsPerPage (10)
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedData = allData.slice(start, end);
        
        if (allData.length === 0) {
            tbody.innerHTML = "<tr><td colspan='3' style='text-align:center; padding:20px;'>No history found.</td></tr>";
        } else {
            tbody.innerHTML = paginatedData.map(item => `
                <tr>
                    <td style="color:var(--primary); font-weight:800;">${item.time}</td>
                    <td style="font-weight:600;">${item.text}</td>
                    <td><span style="background:rgba(79,70,229,0.1); padding:4px 10px; border-radius:8px; color:var(--primary); font-size:0.75rem;">${item.language.toUpperCase()}</span></td>
                </tr>
            `).join('');
        }
        
        // Update Pagination Controls
        document.getElementById('page-num').textContent = `Page ${currentPage}`;
        document.getElementById('prev-btn').disabled = currentPage === 1;
        document.getElementById('next-btn').disabled = end >= allData.length;

    } catch (e) { console.error("History fetch failed:", e); }
}

// --- 3. SIDEBAR RECENT QUERIES (FIXED: LIMIT 5) ---
async function refreshRecentQueries() {
    try {
        const res = await fetch('/api/history');
        const data = await res.json();
        const container = document.getElementById('history-list');
        if (!container) return;
        
        // FIX: Sidebar is strictly limited to 5
        container.innerHTML = data.slice(0, 5).map(item => `
            <div class="history-item" onclick="document.getElementById('user-input').value='${item.text}'; submitQuery();">
                ${item.text.length > 20 ? item.text.substring(0, 20) + '...' : item.text}
            </div>
        `).join('');
    } catch (e) { console.error("Sidebar update failed", e); }
}

// --- 4. UI & LANGUAGE TOGGLE ---
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

// --- 5. QUERY SUBMISSION ---
async function submitQuery() {
    const userInput = document.getElementById('user-input');
    if (!userInput || !userInput.value) return;
    
    try {
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
        
        // Voice Feedback
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(data.response);
        utt.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utt);
        
        refreshRecentQueries();
        userInput.value = ""; 
    } catch (e) { console.error("Query failed", e); }
}

// --- 6. CLEAR HISTORY ---
window.clearLogs = async function() {
    if (!confirm("Clear all logs? This cannot be undone.")) return;
    try {
        const res = await fetch('/api/clear', { method: 'POST' });
        const result = await res.json();
        if (result.status === "success") window.location.reload(); 
    } catch (e) { console.error("Clear error:", e); }
};

// --- 7. INITIALIZATION ---
window.onload = () => {
    updateFullUI();
    refreshRecentQueries();
    
    // History Page Logic
    if (document.getElementById('history-body')) {
        fetchHistoryLogs();
    }

    // Language Toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.lang;
            updateFullUI();
        };
    });

    // Mic Button Listener
    const micBtn = document.getElementById('mic-button');
    if (micBtn) micBtn.onclick = startMic;

    // Stop Button Listener (FIXED)
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.onclick = stopMic;

    // Pagination Listeners
    if (document.getElementById('prev-btn')) {
        document.getElementById('prev-btn').onclick = () => { 
            if (currentPage > 1) { currentPage--; fetchHistoryLogs(); } 
        };
    }
    if (document.getElementById('next-btn')) {
        document.getElementById('next-btn').onclick = () => { 
            currentPage++; fetchHistoryLogs(); 
        };
    }
};
