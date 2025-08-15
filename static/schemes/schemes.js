// Scheme Data and Rendering Functions
import { getTranslation, getCurrentLanguage } from './language.js';
import { isSchemeInSaved, saveSchemeToLocalStorage } from './storage.js';
import { loadAndDisplaySavedSchemes } from './main.js';

// Get eligible schemes based on user profile
export function getEligibleSchemes(userProfile) {
  if (!userProfile) return [];
  
  const allSchemes = getAllSchemes();
  
  // Filter schemes based on eligibility criteria
  return allSchemes.filter(scheme => {
    let matchScore = 0;
    let criteriaCount = 0;
    
    // Check land size criteria
    if (scheme.eligibility.landSize) {
      criteriaCount++;
      const [min, max] = scheme.eligibility.landSize;
      if (userProfile.landSize >= min && (max === null || userProfile.landSize <= max)) {
        matchScore++;
      }
    }
    
    // Check district criteria
    if (scheme.eligibility.districts && scheme.eligibility.districts.length > 0) {
      criteriaCount++;
      if (scheme.eligibility.districts.includes(userProfile.district)) {
        matchScore++;
      }
    }
    
    // Check crop type criteria
    if (scheme.eligibility.cropTypes && scheme.eligibility.cropTypes.length > 0) {
      criteriaCount++;
      if (scheme.eligibility.cropTypes.includes(userProfile.cropType)) {
        matchScore++;
      }
    }
    
    // Check irrigation criteria
    if (scheme.eligibility.irrigationTypes && scheme.eligibility.irrigationTypes.length > 0) {
      criteriaCount++;
      if (scheme.eligibility.irrigationTypes.includes(userProfile.irrigationType)) {
        matchScore++;
      }
    }
    
    // Calculate match percentage
    const matchPercentage = criteriaCount > 0 ? (matchScore / criteriaCount) : 0;
    
    // Set eligibility level based on match percentage
    if (matchPercentage >= 0.7) {
      scheme.eligibilityLevel = 'high';
    } else if (matchPercentage >= 0.4) {
      scheme.eligibilityLevel = 'medium';
    } else {
      scheme.eligibilityLevel = 'low';
    }
    
    // Consider a scheme eligible if it matches at least one criterion
    return matchScore > 0;
  }).sort((a, b) => {
    // Sort by eligibility level (high > medium > low)
    const levelOrder = { high: 3, medium: 2, low: 1 };
    return levelOrder[b.eligibilityLevel] - levelOrder[a.eligibilityLevel];
  });
}

// Render scheme cards
export function renderSchemeCards(schemes, container) {
  // Clear container
  container.innerHTML = '';
  
  // Current language
  const lang = getCurrentLanguage();
  
  // Render each scheme
  schemes.forEach(scheme => {
    const schemeCard = document.createElement('div');
    schemeCard.className = 'scheme-card fade-in';
    
    // Determine if the scheme is saved
    const isSaved = isSchemeInSaved(scheme.id);
    
    // Create scheme card HTML structure
    schemeCard.innerHTML = `
      <div class="scheme-card-header">
        <h4>${scheme.name[lang]}</h4>
      </div>
      <div class="scheme-card-body">
        <div class="eligibility-indicator eligibility-${scheme.eligibilityLevel}">
          ${getTranslation('eligibility')}: ${getTranslation(scheme.eligibilityLevel)}
        </div>
        <p class="scheme-description">${scheme.description[lang]}</p>
        <div class="scheme-meta">
          <div class="scheme-meta-item">
            <span class="scheme-meta-label">${getTranslation('eligibilityCriteria')}</span>
            <span class="scheme-meta-value">${scheme.eligibilityCriteria[lang]}</span>
          </div>
          <div class="scheme-meta-item">
            <span class="scheme-meta-label">${getTranslation('benefits')}</span>
            <span class="scheme-meta-value">${scheme.benefits[lang]}</span>
          </div>
          <div class="tags">
            ${scheme.tags[lang].map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="scheme-card-footer">
        <a href="${scheme.applicationLink}" target="_blank" class="btn btn-apply">${getTranslation('apply')}</a>
        ${isSaved 
          ? `<button class="btn btn-saved" disabled>${getTranslation('saved')}</button>` 
          : `<button class="btn btn-save" data-scheme-id="${scheme.id}">${getTranslation('save')}</button>`
        }
      </div>
    `;
    
    // Add the card to the container
    container.appendChild(schemeCard);
    
    // Add event listener to save button if not already saved
    if (!isSaved) {
      const saveButton = schemeCard.querySelector('.btn-save');
      saveButton.addEventListener('click', function() {
        const schemeId = this.getAttribute('data-scheme-id');
        const schemeToSave = schemes.find(s => s.id === schemeId);
        
        if (schemeToSave) {
          const wasAdded = saveSchemeToLocalStorage(schemeToSave);
          
          if (wasAdded) {
            // Update the button to show saved state
            this.classList.remove('btn-save');
            this.classList.add('btn-saved', 'save-pulse');
            this.disabled = true;
            this.textContent = getTranslation('saved');
            
            // Refresh saved schemes display
            loadAndDisplaySavedSchemes();
          }
        }
      });
    }
  });
}

// Get all available schemes (mock data)
function getAllSchemes() {
  return [
    {
      id: 'pmkisan',
      name: {
        en: 'PM-KISAN',
        ta: 'பிஎம்-கிசான்'
      },
      description: {
        en: 'The Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) provides financial support to eligible farmers.',
        ta: 'பிரதான் மந்திரி கிசான் சம்மான் நிதி (பிஎம்-கிசான்) தகுதியான விவசாயிகளுக்கு நிதி உதவி வழங்குகிறது.'
      },
      eligibilityCriteria: {
        en: 'All small and marginal farmers with combined landholdings of up to 2 hectares',
        ta: 'அனைத்து சிறு மற்றும் குறு விவசாயிகள், 2 ஹெக்டேர் வரை நிலம் வைத்திருப்பவர்கள்'
      },
      benefits: {
        en: 'Rs. 6,000 per year in three equal installments directly transferred to farmers\' bank accounts',
        ta: 'ஆண்டுக்கு ரூ. 6,000, மூன்று சம தவணைகளில் நேரடியாக விவசாயிகளின் வங்கிக் கணக்கில் செலுத்தப்படும்'
      },
      tags: {
        en: ['Financial Aid', 'Direct Benefit Transfer', 'Income Support'],
        ta: ['நிதி உதவி', 'நேரடி பலன் பரிமாற்றம்', 'வருமான ஆதரவு']
      },
      eligibility: {
        landSize: [0, 5], // Up to 5 acres
        districts: null, // Available in all districts
        cropTypes: null, // For all crop types
        irrigationTypes: null // All irrigation types
      },
      applicationLink: '#'
    },
    {
      id: 'pmfby',
      name: {
        en: 'Pradhan Mantri Fasal Bima Yojana',
        ta: 'பிரதான் மந்திரி பசல் பீமா யோஜனா'
      },
      description: {
        en: 'PMFBY provides comprehensive insurance coverage against crop failure due to non-preventable natural risks.',
        ta: 'பிஎம்எஃப்பிஒய் தடுக்க முடியாத இயற்கை அபாயங்களால் ஏற்படும் பயிர் இழப்புக்கு விரிவான காப்பீட்டு பாதுகாப்பை வழங்குகிறது.'
      },
      eligibilityCriteria: {
        en: 'All farmers growing notified crops and paying the premium',
        ta: 'அறிவிக்கப்பட்ட பயிர்களை வளர்த்து பிரீமியம் செலுத்தும் அனைத்து விவசாயிகளும்'
      },
      benefits: {
        en: 'Comprehensive risk insurance from pre-sowing to post-harvest with minimal premium',
        ta: 'விதைப்புக்கு முன் முதல் அறுவடைக்குப் பின் வரை குறைந்த பிரீமியத்தில் விரிவான அபாயக் காப்பீடு'
      },
      tags: {
        en: ['Crop Insurance', 'Risk Management', 'Natural Calamities'],
        ta: ['பயிர் காப்பீடு', 'அபாய மேலாண்மை', 'இயற்கை பேரிடர்கள்']
      },
      eligibility: {
        landSize: [1, null], // Any size above 1 acre
        districts: null, // All districts
        cropTypes: ['Rice', 'Sugarcane', 'Cotton', 'Groundnut'], // Specific crops
        irrigationTypes: null // All irrigation types
      },
      applicationLink: '#'
    },
    {
      id: 'pmksy',
      name: {
        en: 'Pradhan Mantri Krishi Sinchayee Yojana',
        ta: 'பிரதான் மந்திரி கிருஷி சின்சாய் யோஜனா'
      },
      description: {
        en: 'PMKSY aims to ensure access to irrigation to all agricultural farms and improve water use efficiency.',
        ta: 'பிஎம்கேஎஸ்ஒய் அனைத்து விவசாய நிலங்களுக்கும் நீர்ப்பாசன அணுகலை உறுதிசெய்து, நீர் பயன்பாட்டு திறனை மேம்படுத்த இலக்கு கொண்டுள்ளது.'
      },
      eligibilityCriteria: {
        en: 'Farmers with agricultural land interested in improving irrigation efficiency',
        ta: 'நீர்ப்பாசன திறனை மேம்படுத்த ஆர்வமுள்ள விவசாய நிலம் கொண்ட விவசாயிகள்'
      },
      benefits: {
        en: 'Financial assistance for micro-irrigation, watershed development, and improved irrigation techniques',
        ta: 'நுண் நீர்ப்பாசனம், நீர்ப்பிடிப்பு மேம்பாடு மற்றும் மேம்படுத்தப்பட்ட நீர்ப்பாசன நுட்பங்களுக்கான நிதி உதவி'
      },
      tags: {
        en: ['Irrigation', 'Water Conservation', 'Micro-irrigation'],
        ta: ['நீர்ப்பாசனம்', 'நீர் பாதுகாப்பு', 'நுண் நீர்ப்பாசனம்']
      },
      eligibility: {
        landSize: [0, null], // Any size
        districts: null, // All districts
        cropTypes: null, // All crops
        irrigationTypes: ['Drip', 'Sprinkler', 'Well'] // Specific irrigation types
      },
      applicationLink: '#'
    },
    {
      id: 'smam',
      name: {
        en: 'Sub-Mission on Agricultural Mechanization',
        ta: 'வேளாண் இயந்திரமயமாக்கல் துணை இயக்கம்'
      },
      description: {
        en: 'SMAM promotes agricultural mechanization among small and marginal farmers and areas with low mechanization.',
        ta: 'எஸ்எம்ஏஎம் சிறு மற்றும் குறு விவசாயிகள் மற்றும் குறைந்த இயந்திரமயமாக்கல் உள்ள பகுதிகளில் வேளாண் இயந்திரமயமாக்கலை ஊக்குவிக்கிறது.'
      },
      eligibilityCriteria: {
        en: 'All categories of farmers with priority to small and marginal farmers',
        ta: 'சிறு மற்றும் குறு விவசாயிகளுக்கு முன்னுரிமை கொடுக்கப்பட்டு அனைத்து வகை விவசாயிகளும்'
      },
      benefits: {
        en: 'Subsidies for purchase of agricultural machinery, establishment of custom hiring centers',
        ta: 'வேளாண் இயந்திரங்கள் வாங்குவதற்கான மானியங்கள், வாடகை மையங்கள் அமைத்தல்'
      },
      tags: {
        en: ['Farm Mechanization', 'Equipment Subsidy', 'Productivity'],
        ta: ['பண்ணை இயந்திரமயமாக்கல்', 'உபகரண மானியம்', 'உற்பத்தித்திறன்']
      },
      eligibility: {
        landSize: [2, 10], // 2-10 acres
        districts: ['Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Erode'], // Industrialized districts
        cropTypes: ['Rice', 'Sugarcane', 'Cotton'], // Labor-intensive crops
        irrigationTypes: null // All irrigation types
      },
      applicationLink: '#'
    },
    {
      id: 'pkvy',
      name: {
        en: 'Paramparagat Krishi Vikas Yojana',
        ta: 'பரம்பராகத் கிருஷி விகாஸ் யோஜனா'
      },
      description: {
        en: 'PKVY promotes organic farming through adoption of organic farming practices and certification.',
        ta: 'பிகேவிஒய் இயற்கை விவசாய நடைமுறைகள் மற்றும் சான்றிதழ் மூலம் இயற்கை விவசாயத்தை ஊக்குவிக்கிறது.'
      },
      eligibilityCriteria: {
        en: 'Farmers willing to adopt organic farming practices in clusters of 50 acres or more',
        ta: '50 ஏக்கர் அல்லது அதற்கு மேற்பட்ட நிலப்பரப்பில் இயற்கை விவசாய முறைகளைப் பின்பற்ற விரும்பும் விவசாயிகள்'
      },
      benefits: {
        en: 'Financial assistance for organic inputs, certification, marketing, and capacity building',
        ta: 'இயற்கை உள்ளீடுகள், சான்றிதழ், சந்தைப்படுத்துதல் மற்றும் திறன் மேம்பாட்டிற்கான நிதி உதவி'
      },
      tags: {
        en: ['Organic Farming', 'Certification', 'Sustainable Agriculture'],
        ta: ['இயற்கை விவசாயம்', 'சான்றிதழ்', 'நிலையான வேளாண்மை']
      },
      eligibility: {
        landSize: [1, 20], // 1-20 acres
        districts: ['Dindigul', 'Erode', 'Nilgiris', 'Coimbatore'], // Districts with organic potential
        cropTypes: ['Rice', 'Millets', 'Pulses', 'Coconut'], // Suitable for organic
        irrigationTypes: ['Well', 'Tank', 'Rainfed'] // Traditional irrigation
      },
      applicationLink: '#'
    },
    {
      id: 'rkvy',
      name: {
        en: 'Rashtriya Krishi Vikas Yojana',
        ta: 'ராஷ்ட்ரிய கிருஷி விகாஸ் யோஜனா'
      },
      description: {
        en: 'RKVY aims to achieve 4% annual growth in agriculture through development of agriculture and allied sectors.',
        ta: 'ஆர்கேவிஒய் வேளாண்மை மற்றும் அதன் தொடர்புடைய துறைகளின் வளர்ச்சி மூலம் ஆண்டுக்கு 4% வேளாண் வளர்ச்சியை அடைய இலக்கு கொண்டுள்ளது.'
      },
      eligibilityCriteria: {
        en: 'Individual farmers, farmer groups, or agricultural entrepreneurs',
        ta: 'தனிநபர் விவசாயிகள், விவசாயிகள் குழுக்கள் அல்லது வேளாண் தொழில்முனைவோர்'
      },
      benefits: {
        en: 'Financial assistance for infrastructure development, farm-level activities, and value addition',
        ta: 'உள்கட்டமைப்பு மேம்பாடு, பண்ணை-நிலை செயல்பாடுகள் மற்றும் மதிப்பு கூட்டலுக்கான நிதி உதவி'
      },
      tags: {
        en: ['Agricultural Development', 'Infrastructure', 'Value Addition'],
        ta: ['வேளாண் மேம்பாடு', 'உள்கட்டமைப்பு', 'மதிப்பு கூட்டல்']
      },
      eligibility: {
        landSize: [3, null], // 3+ acres
        districts: null, // All districts
        cropTypes: null, // All crops
        irrigationTypes: null // All irrigation types
      },
      applicationLink: '#'
    },
    {
      id: 'midh',
      name: {
        en: 'Mission for Integrated Development of Horticulture',
        ta: 'தோட்டக்கலை ஒருங்கிணைந்த மேம்பாட்டுக்கான திட்டம்'
      },
      description: {
        en: 'MIDH promotes holistic growth of horticulture sector through technology promotion, extension, post-harvest management.',
        ta: 'எம்ஐடிஎச் தொழில்நுட்ப ஊக்குவிப்பு, விரிவாக்கம், அறுவடைக்குப் பிந்தைய மேலாண்மை மூலம் தோட்டக்கலைத் துறையின் முழுமையான வளர்ச்சியை ஊக்குவிக்கிறது.'
      },
      eligibilityCriteria: {
        en: 'Farmers engaged in horticulture cultivation and related activities',
        ta: 'தோட்டக்கலை பயிர் சாகுபடி மற்றும் தொடர்புடைய செயல்பாடுகளில் ஈடுபட்டுள்ள விவசாயிகள்'
      },
      benefits: {
        en: 'Subsidies for planting material, cultivation practices, protected cultivation, and market infrastructure',
        ta: 'நடவுப் பொருட்கள், சாகுபடி முறைகள், பாதுகாக்கப்பட்ட சாகுபடி மற்றும் சந்தை உள்கட்டமைப்புக்கான மானியங்கள்'
      },
      tags: {
        en: ['Horticulture', 'Fruits & Vegetables', 'Protected Cultivation'],
        ta: ['தோட்டக்கலை', 'பழங்கள் & காய்கறிகள்', 'பாதுகாக்கப்பட்ட சாகுபடி']
      },
      eligibility: {
        landSize: [1, 15], // 1-15 acres
        districts: null, // All districts
        cropTypes: ['Mango', 'Banana', 'Coconut'], // Horticultural crops
        irrigationTypes: ['Drip', 'Sprinkler'] // Modern irrigation
      },
      applicationLink: '#'
    }
  ];
}