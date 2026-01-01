let currentLanguage = 'en';
let recognition;
let currentPage = 1;
const itemsPerPage = 8;

const UI_TEXT = {
    en: { home: "Home", history: "History", recent: "RECENT QUERIES", status: "Bridge Active", tap: "Tap to Speak", stop: "Stop Listening", try: "TRY ASKING", listening: "Listening...", clear: "Clear History" },
    hi: { home: "मुख्य", history: "इतिहास", recent: "हाल के प्रश्न", status: "ब्रिज सक्रिय है", tap: "बोलने के लिए टैप करें", stop: "सुनना बंद करें", try: "पूछ कर देखें", listening: "सुन रहा हूँ...", clear: "इतिहास साफ़ करें" }
};

const PROMPTS = {
    en: ["Hi", "Help", "Ayushman Bharat", "Ration Card", "PM Kisan", "Hospitals", "Police 100", "Ambulance 108", "Apply Card", "Benefits", "Farmer Info", "Emergency", "Health ID", "Contact", "Status"],
    hi: ["नमस्ते", "मदद", "आयुष्मान भारत", "राशन कार्ड", "पीएम किसान", "अस्पताल", "पुलिस १००", "एम्बुलेंस १०८", "आवेदन", "फायदे", "किसान सूचना", "आपातकाल", "हेल्थ कार्ड", "संपर्क", "स्थिति"]
};

// --- 1. ACTIVITY LOGS FETCH & RENDER ---
async function fetchHistoryLogs() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return; 

    try {
        const res = await fetch('/api/history');
        const allData = await res.json();
        
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedData = allData.slice(start, end);
        
        if (paginatedData.length === 0) {
            tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>No logs found.</td></tr>";
        } else {
            tbody.innerHTML = paginatedData.map(item => `
                <tr>
                    <td style="color:var(--primary); font-weight:800;">${item.time}</td>
                    <td style="font-weight:600;">${item.text}</td>
                    <td><span style="background:rgba(79,70,229,0.1); padding:4px 10px; border-radius:8px; color:var(--primary); font-size:0.75rem;">${item.language.toUpperCase()}</span></td>
                </tr>
            `).join('');
        }
        
        document.getElementById('page-num').textContent = `Page ${currentPage}`;
        document.getElementById('prev-btn').disabled = currentPage === 1;
        document.getElementById('next-btn').disabled = end >= allData.length;
    } catch (e) {
        console.error("Fetch error:", e);
        tbody.innerHTML = "<tr><td colspan='3' style='text-align:center; color:red;'>Failed to load logs.</td></tr>";
    }
}

// --- 2. CLEAR HISTORY FUNCTION ---
window.clearLogs = async function() {
    if (!confirm("Are you sure? This will delete all saved logs permanently.")) return;
    try {
        const res = await fetch('/api/clear', { method: 'POST' });
        const result = await res.json();
        if (result.status === "success") {
            window.location.reload(); 
        }
    } catch (e) {
        console.error("Clear error:", e);
        alert("Server error while clearing logs.");
    }
};

// --- 3. RECENT QUERIES SIDEBAR (LIMIT 5) ---
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

// --- 4. MIC & SPEECH RECOGNITION ---
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.onstart = () => { 
        document.getElementById('mic-container').classList.add('pulse-active'); 
        document.getElementById('mic-label').textContent = UI_TEXT[currentLanguage].listening;
    };
    recognition.onend = () => { 
        document.getElementById('mic-container').classList.remove('pulse-active');
        document.getElementById('mic-label').textContent = UI_TEXT[currentLanguage].tap;
        if (document.getElementById('user-input').value) submitQuery(); 
    };
    recognition.onresult = (e) => { document.getElementById('user-input').value = e.results[0][0].transcript; };
}

// --- 5. INITIALIZATION & EVENTS ---
window.onload = () => {
    if (document.getElementById('history-body')) fetchHistoryLogs();
    refreshRecentQueries();

    document.getElementById('mic-button')?.addEventListener('click', () => recognition.start());
    document.getElementById('pause-btn')?.addEventListener('click', () => {
        recognition.stop();
        window.speechSynthesis.cancel();
    });

    document.getElementById('prev-btn')?.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; fetchHistoryLogs(); }
    });
    document.getElementById('next-btn')?.addEventListener('click', () => {
        currentPage++; fetchHistoryLogs();
    });
};
