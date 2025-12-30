let currentLanguage = 'en';
let currentService = 'auto'; // Auto-detect service from intent
let recognition;
let isListening = false;
let currentUtterance = null; // Track current speech for cancellation

const translations = {
    en: {
        title: 'AwaazSetu',
        subtitle: 'Your Voice Bridge to Services',
        tagline: 'Speak in Hindi or English to get help with government and healthcare services.',
        micLabel: 'Tap & Speak',
        listening: 'Listening...',
        tryAsking: 'Try asking:',
        prompt1: 'नमस्ते',
        prompt2: 'Emergency number',
        prompt3: 'I have fever',
        prompt4: 'राशन कार्ड कैसे बनवाएं?',
        prompt5: 'What is Ayushman Bharat?',
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
        tagline: 'सरकारी और स्वास्थ्य सेवाओं में मदद के लिए हिंदी या अंग्रेजी में बोलें।',
        micLabel: 'बोलने के लिए टैप करें',
        listening: 'सुन रहा हूँ...',
        tryAsking: 'पूछने का प्रयास करें:',
        prompt1: 'नमस्ते',
        prompt2: 'आपातकाल नंबर',
        prompt3: 'मुझे बुखार है',
        prompt4: 'राशन कार्ड कैसे बनवाएं?',
        prompt5: 'आयुष्मान भारत क्या है?',
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
            // Force text section visible so user sees the text appearing
            document.getElementById('text-input-section').style.display = 'block';
            document.getElementById('response-section').style.display = 'none';
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

    const text = document.getElementById('user-input').value.trim();

    // ✅ Auto-submit only if user actually spoke something
    if (text.length > 0) {
        submitQuery();
    }
};

}

function stopListening() {
    isListening = false;
    document.querySelector('.mic-circle').style.background = 'var(--primary)';
    document.getElementById('mic-label').textContent = translations[currentLanguage].micLabel;
}

// Text-to-Speech function using Web Speech API
function speakText(text, language) {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser');
        return;
    }
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on current selection
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    
    // Set faster speech rate for better user experience
    utterance.rate = 1.2;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Store current utterance for cancellation
    currentUtterance = utterance;
    
    // Handle speech events
    utterance.onend = () => {
        currentUtterance = null;
        // Update speaker button state if it exists
        const speakerBtn = document.getElementById('speaker-btn');
        if (speakerBtn) {
            speakerBtn.classList.remove('speaking');
        }
    };
    
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        currentUtterance = null;
        const speakerBtn = document.getElementById('speaker-btn');
        if (speakerBtn) {
            speakerBtn.classList.remove('speaking');
        }
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    
    // Update speaker button state if it exists
    const speakerBtn = document.getElementById('speaker-btn');
    if (speakerBtn) {
        speakerBtn.classList.add('speaking');
    }
}

// Function to stop current speech
function stopSpeech() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
    const speakerBtn = document.getElementById('speaker-btn');
    if (speakerBtn) {
        speakerBtn.classList.remove('speaking');
    }
}

function updateLanguage() {
    const t = translations[currentLanguage];
    document.getElementById('app-title').textContent = t.title;
    document.getElementById('app-subtitle').textContent = t.subtitle;
    if (document.getElementById('app-tagline')) {
        document.getElementById('app-tagline').textContent = t.tagline;
    }
    document.getElementById('mic-label').textContent = t.micLabel;
    if (document.getElementById('try-asking-label')) {
        document.getElementById('try-asking-label').textContent = t.tryAsking;
    }
    if (document.getElementById('prompt-1')) {
        document.getElementById('prompt-1').textContent = t.prompt1;
        document.getElementById('prompt-2').textContent = t.prompt2;
        document.getElementById('prompt-3').textContent = t.prompt3;
        document.getElementById('prompt-4').textContent = t.prompt4;
        document.getElementById('prompt-5').textContent = t.prompt5;
    }
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

// Service selection removed - service is now auto-detected from intent

document.getElementById('mic-button').addEventListener('click', function() {
    if (recognition) {
        if (isListening) {
            recognition.stop();
        } else {
            // Force language setup right before starting
            recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
            try {
                recognition.start();
            } catch (err) {
                console.error('Error starting recognition:', err);
                // Only if starting fails, we might show text input as a LAST resort
                // but let's try to just log for now to satisfy "ONLY start speech"
            }
        }
    } else {
        // Only if recognition is totally unavailable (unsupported browser)
        alert(currentLanguage === 'en' 
            ? 'Your browser does not support voice recognition. Please use a modern browser like Chrome.' 
            : 'आपका ब्राउज़र वॉयस रिकग्निशन को सपोर्ट नहीं करता है। कृपया क्रोम जैसा आधुनिक ब्राउज़र उपयोग करें।');
    }
});

document.getElementById('cancel-btn').addEventListener('click', function() {
    // Stop any ongoing speech when canceling
    stopSpeech();
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
    // Stop any ongoing speech when starting new query
    stopSpeech();
    document.getElementById('response-section').style.display = 'none';
    document.getElementById('mic-button').style.display = 'flex';
    document.getElementById('text-input-section').style.display = 'none';
    document.getElementById('user-input').value = '';
});

// Speaker button event listener
const speakerBtn = document.getElementById('speaker-btn');
if (speakerBtn) {
    speakerBtn.addEventListener('click', function() {
        const responseText = document.getElementById('response-text').textContent;
        if (responseText) {
            // If already speaking, stop it; otherwise, speak
            if (window.speechSynthesis.speaking) {
                stopSpeech();
            } else {
                speakText(responseText, currentLanguage);
            }
        }
    });
}

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
        
        // Automatically speak the response
        speakText(data.response, currentLanguage);

    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        alert(currentLanguage === 'en'
            ? 'Error connecting to server. Please try again.'
            : 'सर्वर से कनेक्ट करने में त्रुटि। कृपया पुनः प्रयास करें।');
        document.getElementById('mic-button').style.display = 'flex';
    }
}
