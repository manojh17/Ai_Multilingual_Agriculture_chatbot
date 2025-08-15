// Storage Related Functions

// Load user profile from localStorage
export function loadUserProfile() {
  const profileData = localStorage.getItem('userProfile');
  
  if (profileData) {
    try {
      return JSON.parse(profileData);
    } catch (e) {
      console.error('Error parsing user profile:', e);
      return null;
    }
  }
  
  return null;
}

// Save user profile to localStorage
export function saveUserProfile(profile) {
  localStorage.setItem('userProfile', JSON.stringify(profile));
}

// Create mock user profile for demonstration
export function mockUserProfile() {
  // Districts in Tamil Nadu
  const districts = [
    'Chennai', 'Coimbatore', 'Madurai', 
    'Tiruchirappalli', 'Salem', 'Tirunelveli', 
    'Thoothukudi', 'Thanjavur', 'Dindigul', 
    'Erode', 'Vellore', 'Kanchipuram'
  ];
  
  // Crop types common in Tamil Nadu
  const cropTypes = [
    'Rice', 'Sugarcane', 'Cotton', 
    'Groundnut', 'Millets', 'Pulses', 
    'Coconut', 'Banana', 'Mango'
  ];
  
  // Irrigation types
  const irrigationTypes = [
    'Well', 'Canal', 'Tank', 
    'Drip', 'Sprinkler', 'Rainfed'
  ];
  
  // Generate random profile
  const profile = {
    landSize: Math.floor(Math.random() * 20) + 1, // 1-20 acres
    district: districts[Math.floor(Math.random() * districts.length)],
    cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
    irrigationType: irrigationTypes[Math.floor(Math.random() * irrigationTypes.length)],
    lastUpdated: new Date().toISOString()
  };
  
  // Save the profile
  saveUserProfile(profile);
  
  return profile;
}

// Load saved schemes from localStorage
export function loadSavedSchemes() {
  const savedData = localStorage.getItem('savedSchemes');
  
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('Error parsing saved schemes:', e);
      return [];
    }
  }
  
  return [];
}

// Save schemes to localStorage
export function saveSchemeToLocalStorage(scheme) {
  const savedSchemes = loadSavedSchemes();
  
  // Check if scheme is already saved (avoid duplicates)
  const isAlreadySaved = savedSchemes.some(savedScheme => savedScheme.id === scheme.id);
  
  if (!isAlreadySaved) {
    savedSchemes.push(scheme);
    localStorage.setItem('savedSchemes', JSON.stringify(savedSchemes));
    return true;
  }
  
  return false;
}

// Remove saved scheme from localStorage
export function removeSavedScheme(schemeId) {
  const savedSchemes = loadSavedSchemes();
  const updatedSchemes = savedSchemes.filter(scheme => scheme.id !== schemeId);
  
  localStorage.setItem('savedSchemes', JSON.stringify(updatedSchemes));
  
  return updatedSchemes;
}

// Check if a scheme is saved
export function isSchemeInSaved(schemeId) {
  const savedSchemes = loadSavedSchemes();
  return savedSchemes.some(scheme => scheme.id === schemeId);
}