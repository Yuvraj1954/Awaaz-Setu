let currentLanguage = 'en';
let currentService = 'government';
let recognition;
let isListening = false;

const translations = {
    en: {
        title: 'AwaazSetu',
        subtitle: 'Your Voice Bridge to Services',
        serviceLabel: 'Choose Service',
        govt: 'Government Services',
        health: 'Healthcare',
        micLabel: 'Tap to Speak',
        listening: 'Listening...',
        inputLabel: 'How can we help you?',
        inputPlaceholder: 'Type your question here...',
        submit: 'Ask Question',
        cancel: 'Cancel',
        responseTitle: 'Response',
        newQuery: 'Ask Another Question',
        loading: 'Finding information...'
    },
    hi: {
        title: 'आवाज़सेतु',
        subtitle: 'सेवाओं के लिए आपका आवाज़ पुल',
        serviceLabel: 'सेवा चुनें',
        govt: 'सरकारी सेवाएं',
        health: 'स्वास्थ्य सेवा',
        micLabel: 'बोलने के लिए टैप करें',
        listening: 'सुन रहा हूँ...',
        inputLabel: 'हम आपकी कैसे मदद कर सकते हैं?',
        inputPlaceholder: 'अपना सवाल यहाँ लिखें...',
        submit: 'सवाल पूछें',
        cancel: 'रद्द करें',
        responseTitle: 'जवाब',
        newQuery: 'दूसरा सवाल पूछें',
        loading: 'जानकारी ढूंढ रहे हैं...'
    }
};

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true; // Enabled interim results for better responsiveness

    recognition.onstart = () => {
        isListening = true;
        document.querySelector('.mic-circle').style.background = '#ef4444';
        document.getElementById('mic-label').textContent = translations[currentLanguage].listening;
        console.log('Speech recognition started');
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        const transcript = finalTranscript || interimTranscript;
        if (transcript) {
            document.getElementById('user-input').value = transcript;
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific errors
        if (event.error === 'network') {
            console.warn('Network error during speech recognition. This can happen in some browser environments or with poor connectivity.');
            // Don't alert immediately as it might be transient, just stop UI
        } else if (event.error === 'not-allowed') {
            alert(currentLanguage === 'en' 
                ? 'Microphone access denied. Please enable it in browser settings.' 
                : 'माइक्रोफोन एक्सेस अस्वीकार कर दिया गया। कृपया ब्राउज़र सेटिंग्स में इसे सक्षम करें।');
        }
        
        stopListening();
    };

    recognition.onend = () => {
        console.log('Speech recognition ended');
        stopListening();
    };
}

function stopListening() {
    isListening = false;
    document.querySelector('.mic-circle').style.background = 'var(--primary)';
    document.getElementById('mic-label').textContent = translations[currentLanguage].micLabel;
}

function updateLanguage() {
    const t = translations[currentLanguage];
    document.getElementById('app-title').textContent = t.title;
    document.getElementById('app-subtitle').textContent = t.subtitle;
    document.getElementById('service-title-label').textContent = t.serviceLabel;
    document.getElementById('govt-label').textContent = t.govt;
    document.getElementById('health-label').textContent = t.health;
    document.getElementById('mic-label').textContent = t.micLabel;
    document.getElementById('input-label').textContent = t.inputLabel;
    document.getElementById('user-input').placeholder = t.inputPlaceholder;
    document.getElementById('submit-text').textContent = t.submit;
    document.getElementById('cancel-text').textContent = t.cancel;
    document.getElementById('response-title').textContent = t.responseTitle;
    document.getElementById('new-query-text').textContent = t.newQuery;
    document.getElementById('loading-text').textContent = t.loading;
    document.documentElement.lang = currentLanguage;
    
    if (recognition) {
        recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    }
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentLanguage = this.dataset.lang;
        updateLanguage();
    });
});

document.querySelectorAll('.service-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.service-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentService = this.dataset.service;
    });
});

document.getElementById('mic-button').addEventListener('click', function() {
    if (recognition) {
        if (isListening) {
            recognition.stop();
        } else {
            // Hide response if any and focus input area visually (but don't hide mic)
            document.getElementById('response-section').style.display = 'none';
            document.getElementById('text-input-section').style.display = 'block';
            
            recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
            recognition.start();
        }
    } else {
        // Fallback for browsers without speech support
        document.getElementById('mic-button').style.display = 'none';
        document.getElementById('text-input-section').style.display = 'block';
    }
});

document.getElementById('cancel-btn').addEventListener('click', function() {
    document.getElementById('text-input-section').style.display = 'none';
    document.getElementById('mic-button').style.display = 'flex';
    document.getElementById('user-input').value = '';
});

document.getElementById('submit-btn').addEventListener('click', function() {
    submitQuery();
});

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitQuery();
    }
});

document.getElementById('new-query-btn').addEventListener('click', function() {
    document.getElementById('response-section').style.display = 'none';
    document.getElementById('mic-button').style.display = 'flex';
    document.getElementById('text-input-section').style.display = 'none';
    document.getElementById('user-input').value = '';
});

async function submitQuery() {
    const text = document.getElementById('user-input').value.trim();

    if (!text) {
        alert(currentLanguage === 'en' ? 'Please type or speak your question' : 'कृपया अपना सवाल बोलें या लिखें');
        return;
    }

    document.getElementById('text-input-section').style.display = 'none';
    document.getElementById('loading').style.display = 'flex';

    try {
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                service: currentService,
                language: currentLanguage
            })
        });

        const data = await response.json();

        document.getElementById('loading').style.display = 'none';
        document.getElementById('response-text').textContent = data.response;
        document.getElementById('response-section').style.display = 'block';

    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        alert(currentLanguage === 'en'
            ? 'Error connecting to server. Please try again.'
            : 'सर्वर से कनेक्ट करने में त्रुटि। कृपया पुनः प्रयास करें।');
        document.getElementById('mic-button').style.display = 'flex';
    }
}
