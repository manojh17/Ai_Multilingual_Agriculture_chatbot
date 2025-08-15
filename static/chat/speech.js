/**
 * Speech functionality for the agricultural chatbot
 * Handles speech recognition and text-to-speech
 */

// Speech state
let recognizing = false;
let recognition = null;
let synthesis = null;
let speakerEnabled = false;

// Initialize speech functionality
function initSpeech() {
  // Check for browser speech support
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Speech recognition not supported');
    disableSpeechFeatures();
    return;
  }
  
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    disableSpeakFeatures();
  } else {
    synthesis = window.speechSynthesis;
  }
  
  // Initialize speech recognition
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = false;
  recognition.interimResults = true;
  
  // Set up recognition events
  setupRecognitionEvents();
  
  // Set up microphone button
  const micButton = document.getElementById('micButton');
  if (micButton) {
    micButton.addEventListener('click', toggleListening);
  }
  
  // Set up speaker button
  const speakerButton = document.getElementById('speakerButton');
  if (speakerButton) {
    speakerButton.addEventListener('click', toggleSpeaker);
  }
}

// Set up speech recognition events
function setupRecognitionEvents() {
  if (!recognition) return;
  
  recognition.onstart = function() {
    recognizing = true;
    updateMicStatus(true);
  };
  
  recognition.onerror = function(event) {
    console.error('Speech recognition error', event.error);
    
    if (event.error === 'no-speech') {
      alert('No speech was detected. Please try again.');
    } else if (event.error === 'audio-capture') {
      alert('No microphone was found. Ensure that a microphone is installed.');
    } else if (event.error === 'not-allowed') {
      alert('Permission to use microphone was denied.');
    }
    
    recognizing = false;
    updateMicStatus(false);
  };
  
  recognition.onend = function() {
    recognizing = false;
    updateMicStatus(false);
  };
  
  recognition.onresult = function(event) {
    let interim_transcript = '';
    let final_transcript = '';
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    
    // Set the interim results to input field
    if (interim_transcript) {
      const userInput = document.getElementById('userInput');
      if (userInput) {
        userInput.value = interim_transcript;
        autoResizeTextarea(userInput);
      }
    }
    
    // If we have a final transcript, submit it
    if (final_transcript) {
      const userInput = document.getElementById('userInput');
      if (userInput) {
        userInput.value = final_transcript;
        // Wait a moment then send the message
        setTimeout(() => {
          sendUserMessage();
        }, 500);
      }
    }
  };
  
  // Set language based on UI language
  recognition.lang = getCurrentLanguage() === 'en' ? 'en-US' : 'ta-IN';
}

// Toggle listening state
function toggleListening() {
  if (recognizing) {
    recognition.stop();
    return;
  }
  
  try {
    // Update language setting
    recognition.lang = getCurrentLanguage() === 'en' ? 'en-US' : 'ta-IN';
    recognition.start();
    
    // Show the voice status
    const voiceStatus = document.getElementById('voiceStatus');
    if (voiceStatus) {
      voiceStatus.classList.add('active');
    }
  } catch (e) {
    console.error('Speech recognition error:', e);
    recognizing = false;
    updateMicStatus(false);
  }
}

// Update microphone button status
function updateMicStatus(isActive) {
  const micButton = document.getElementById('micButton');
  const voiceStatus = document.getElementById('voiceStatus');
  
  if (micButton) {
    toggleClass(micButton, 'active', isActive);
  }
  
  if (voiceStatus) {
    toggleClass(voiceStatus, 'active', isActive);
  }
}

// Toggle speaker state
function toggleSpeaker() {
  speakerEnabled = !speakerEnabled;
  
  const speakerButton = document.getElementById('speakerButton');
  if (speakerButton) {
    toggleClass(speakerButton, 'active', speakerEnabled);
  }
  
  // If turning off, stop any current speech
  if (!speakerEnabled && synthesis) {
    synthesis.cancel();
  }
}

// Check if speaker is enabled
function isSpeakerEnabled() {
  return speakerEnabled;
}

// Speak text using speech synthesis
function speakText(text) {
  if (!synthesis || !speakerEnabled) return;
  
  // Cancel any current speech
  synthesis.cancel();
  
  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language based on current UI language
  utterance.lang = getCurrentLanguage() === 'en' ? 'en-US' : 'ta-IN';
  
  // Optional: Adjust voice properties
  utterance.rate = 1.0; // Speed (0.1 to 10)
  utterance.pitch = 1.0; // Pitch (0 to 2)
  utterance.volume = 1.0; // Volume (0 to 1)
  
  // Optional: Set a voice if available
  const voices = synthesis.getVoices();
  
  // Try to find a matching voice for the current language
  const langCode = getCurrentLanguage() === 'en' ? 'en' : 'ta';
  const matchingVoice = voices.find(voice => 
    voice.lang.startsWith(langCode) && !voice.name.includes('Google')
  ) || voices.find(voice => 
    voice.lang.startsWith(langCode)
  );
  
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }
  
  // Speak the text
  synthesis.speak(utterance);
  
  // Animation for speaker while speaking
  const speakerButton = document.getElementById('speakerButton');
  if (speakerButton) {
    toggleClass(speakerButton, 'speaking', true);
    
    utterance.onend = function() {
      toggleClass(speakerButton, 'speaking', false);
    };
  }
}

// Disable speech features if not supported
function disableSpeechFeatures() {
  const micButton = document.getElementById('micButton');
  if (micButton) {
    micButton.disabled = true;
    micButton.title = 'Speech recognition not supported in this browser';
    micButton.style.opacity = '0.5';
  }
}

// Disable speak features if not supported
function disableSpeakFeatures() {
  const speakerButton = document.getElementById('speakerButton');
  if (speakerButton) {
    speakerButton.disabled = true;
    speakerButton.title = 'Text-to-speech not supported in this browser';
    speakerButton.style.opacity = '0.5';
  }
}