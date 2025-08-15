// Language Toggle Functionality

// Setup language toggle
export function setupLanguageToggle() {
  const languageToggle = document.getElementById('languageToggle');
  
  // Set default language based on localStorage or default to English
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
  setLanguage(savedLanguage);
  
  // Add event listener to language toggle button
  languageToggle.addEventListener('click', function() {
    // Toggle the language
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'ta' ? 'en' : 'ta';
    
    setLanguage(newLang);
    
    // Save the preference to localStorage
    localStorage.setItem('preferredLanguage', newLang);
  });
}

// Set language on the HTML element
function setLanguage(lang) {
  document.documentElement.lang = lang;
  
  // Update document title based on language
  if (lang === 'ta') {
    document.title = 'அரசு திட்ட பரிந்துரைகள் | விவசாய போர்டல்';
  } else {
    document.title = 'Government Scheme Recommendations | Agricultural Portal';
  }
}

// Get current language
export function getCurrentLanguage() {
  return document.documentElement.lang;
}

// Translations for dynamic content
export const translations = {
  eligibility: {
    en: 'Eligibility',
    ta: 'தகுதி'
  },
  high: {
    en: 'High Match',
    ta: 'உயர் பொருத்தம்'
  },
  medium: {
    en: 'Medium Match',
    ta: 'நடுத்தர பொருத்தம்'
  },
  low: {
    en: 'Low Match',
    ta: 'குறைந்த பொருத்தம்'
  },
  apply: {
    en: 'Apply Now',
    ta: 'இப்போது விண்ணப்பிக்கவும்'
  },
  save: {
    en: 'Save to Dashboard',
    ta: 'டாஷ்போர்டில் சேமி'
  },
  saved: {
    en: 'Saved',
    ta: 'சேமிக்கப்பட்டது'
  },
  remove: {
    en: 'Remove',
    ta: 'நீக்கு'
  },
  eligibilityCriteria: {
    en: 'Eligibility Criteria',
    ta: 'தகுதி அளவுகோல்'
  },
  benefits: {
    en: 'Benefits',
    ta: 'நன்மைகள்'
  }
};

// Function to get translated text
export function getTranslation(key, subKey) {
  const lang = getCurrentLanguage();
  
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  
  // Fallback to English
  return translations[key]['en'] || key;
}