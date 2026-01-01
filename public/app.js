let currentLanguage = 'en';
let recognition;

const PROMPTS = {
    en: ["Hi", "Help", "Ayushman Bharat", "Ration Card", "PM Kisan", "Hospitals", "Police 100", "Ambulance 108", "Apply Card", "Benefits", "Farmer Info", "Emergency", "Health ID", "Contact", "Status"],
    hi: ["नमस्ते", "मदद", "आयुष्मान भारत", "राशन कार्ड", "पीएम किसान", "अस्पताल", "पुलिस १००", "एम्बुलेंस १०८", "आवेदन", "फायदे", "किसान सूचना", "आपातकाल", "हेल्थ कार्ड", "संपर्क", "स्थिति"]
};

function renderGrid() {
    const grid = document.getElementById('command-grid');
    if (!grid) return;
    grid.innerHTML = "";
    PROMPTS[currentLanguage].forEach(text => {
        const chip = document.createElement('div');
        chip.className = "suggest-chip";
        chip.textContent = text;
        chip.onclick = () => { document.getElementById('user-input').value = text; submitQuery(); };
        grid.appendChild(chip);
    });
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
        document.getElementById('response-text').textContent = data.response;
        document.getElementById('response-section').style.display = 'block';
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(data.response);
        utt.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utt);
    } catch (e) { console.error(e); }
}

window.onload = () => {
    renderGrid();
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.lang;
            renderGrid();
        };
    });
};

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.onstart = () => { document.getElementById('mic-container').classList.add('pulse-active'); };
    recognition.onresult = (e) => { document.getElementById('user-input').value = e.results[0][0].transcript; };
    recognition.onend = () => { 
        document.getElementById('mic-container').classList.remove('pulse-active');
        if (document.getElementById('user-input').value) submitQuery(); 
    };
}
document.getElementById('mic-button').onclick = () => { recognition.start(); };
