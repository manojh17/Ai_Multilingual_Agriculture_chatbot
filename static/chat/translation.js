/**
 * Translation functionality for the agricultural chatbot
 * Supports English and Tamil languages
 */

// Translation strings object
const translations = {
  en: {
    // Header
    "home": "Home",
    "language": "Language",
    
    // Chatbot header
    "chatbot-title": "Agricultural Assistant",
    "chatbot-subtitle": "Ask me anything about farming",
    
    // Welcome message
    "welcome-message": "Hi! Ask me about your farm in Tamil or English.",
    
    // Input placeholders
    "input-placeholder": "Type your message here...",
    
    // Voice controls
    "listening": "Listening...",
    "speak-message": "Speaking message...",
    
    // Sample messages for display
    "sample-bot-message-1": "How can I help with your farming today?",
    "sample-user-message-1": "When should I plant tomatoes in my region?",
    "sample-bot-message-2": "Tomatoes grow best when planted after the last frost. In your region, late February to early March is ideal for planting tomato seedlings. Ensure they get plenty of sunlight and water regularly."
  },
  ta: {
    // Header
    "home": "முகப்பு",
    "language": "மொழி",
    
    // Chatbot header
    "chatbot-title": "விவசாய உதவியாளர்",
    "chatbot-subtitle": "விவசாயம் பற்றி எதையும் கேளுங்கள்",
    
    // Welcome message
    "welcome-message": "வணக்கம்! தமிழிலோ ஆங்கிலத்திலோ உங்கள் பண்ணை பற்றி கேளுங்கள்.",
    
    // Input placeholders
    "input-placeholder": "இங்கே உங்கள் செய்தியைத் தட்டச்சு செய்யவும்...",
    
    // Voice controls
    "listening": "கேட்கிறது...",
    "speak-message": "செய்தியைப் பேசுகிறது...",
    
    // Sample messages for display
    "sample-bot-message-1": "உங்கள் விவசாயத்தில் எப்படி உதவ முடியும்?",
    "sample-user-message-1": "என் பகுதியில் தக்காளி எப்போது நடலாம்?",
    "sample-bot-message-2": "கடைசி உறைபனிக்குப் பிறகு தக்காளி நடுவது சிறந்தது. உங்கள் பகுதியில், பிப்ரவரி மாத இறுதி முதல் மார்ச் மாத தொடக்கம் வரை தக்காளி நாற்றுகளை நடுவதற்கு சிறந்த நேரம். அவற்றிற்கு போதுமான சூரிய ஒளியும், தவறாமல் நீரும் வழங்குவதை உறுதி செய்யவும்."
  }
};

// Current language (default: English)
let currentLanguage = 'en';

// Initialize translations
function initTranslations() {
  // Set the initial language
  applyTranslations();
  
  // Set up language toggle button
  const languageToggle = document.getElementById('languageToggle');
  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      toggleLanguage();
    });
  }
}

// Toggle between languages
function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'ta' : 'en';
  
  // Update html lang attribute
  document.documentElement.lang = currentLanguage;
  
  // Update the current language display
  const currentLangElement = document.querySelector('.current-lang');
  if (currentLangElement) {
    currentLangElement.textContent = currentLanguage === 'en' ? 'English' : 'தமிழ்';
  }
  
  // Apply translations to all elements
  applyTranslations();
}

// Apply translations to all elements with data-lang-key attributes
function applyTranslations() {
  // Get all elements with translation keys
  const elements = document.querySelectorAll('[data-lang-key]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-lang-key');
    
    // Check if this is an attribute translation
    const attrName = element.getAttribute('data-lang-key-attr');
    if (attrName) {
      // Set the attribute value
      element.setAttribute(attrName, getTranslation(key));
    } else {
      // Set the element's text content
      element.textContent = getTranslation(key);
    }
  });
}

// Get a translation for a specific key
function getTranslation(key) {
  // Check if the key exists in the current language
  if (translations[currentLanguage] && translations[currentLanguage][key]) {
    return translations[currentLanguage][key];
  }
  
  // Fallback to English
  if (translations.en && translations.en[key]) {
    return translations.en[key];
  }
  
  // If no translation found, return the key
  console.warn(`Translation missing for key: ${key}`);
  return key;
}

// Get the current language code
function getCurrentLanguage() {
  return currentLanguage;
}