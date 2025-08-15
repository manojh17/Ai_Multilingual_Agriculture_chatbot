// Import modules
import { setupLanguageToggle } from './language.js';
import { loadUserProfile, mockUserProfile } from './storage.js';
import { getEligibleSchemes, renderSchemeCards } from './schemes.js';
import { loadSavedSchemes, renderSavedSchemes } from './savedSchemes.js';
import { initAnimations } from './animations.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Set up language toggle
  setupLanguageToggle();
  
  // Check if user profile exists, otherwise create mock data
  if (!loadUserProfile()) {
    mockUserProfile();
  }
  
  // Display user profile
  displayUserProfile();
  
  // Get and display eligible schemes
  const userProfile = loadUserProfile();
  const eligibleSchemes = getEligibleSchemes(userProfile);
  renderSchemeCards(eligibleSchemes, document.getElementById('schemesContainer'));
  
  // Check if there are eligible schemes
  if (eligibleSchemes.length === 0) {
    document.getElementById('noSchemes').classList.remove('hidden');
  } else {
    document.getElementById('noSchemes').classList.add('hidden');
  }
  
  // Load and display saved schemes
  loadAndDisplaySavedSchemes();
  
  // Set up event listener for profile update button
  document.getElementById('updateProfile').addEventListener('click', function() {
    // In a real application, this would open a form to update the profile
    // For this demo, we'll just generate a new random profile
    mockUserProfile();
    displayUserProfile();
    
    // Refresh schemes based on new profile
    const updatedProfile = loadUserProfile();
    const updatedSchemes = getEligibleSchemes(updatedProfile);
    renderSchemeCards(updatedSchemes, document.getElementById('schemesContainer'));
    
    if (updatedSchemes.length === 0) {
      document.getElementById('noSchemes').classList.remove('hidden');
    } else {
      document.getElementById('noSchemes').classList.add('hidden');
    }
    
    // Show bounce animation on the profile card
    const profileCard = document.querySelector('.profile-card');
    profileCard.classList.add('bounce');
    setTimeout(() => {
      profileCard.classList.remove('bounce');
    }, 2000);
  });
  
  // Initialize animations
  initAnimations();
});

// Display user profile
function displayUserProfile() {
  const profile = loadUserProfile();
  
  // Update the profile details in the UI
  document.getElementById('landSize').textContent = profile.landSize + ' acres';
  document.getElementById('district').textContent = profile.district;
  document.getElementById('cropType').textContent = profile.cropType;
  document.getElementById('irrigationType').textContent = profile.irrigationType;
}

// Load and display saved schemes
function loadAndDisplaySavedSchemes() {
  const savedSchemes = loadSavedSchemes();
  const savedSchemesContainer = document.getElementById('savedSchemesContainer');
  const noSavedSchemesElement = document.getElementById('noSavedSchemes');
  
  if (savedSchemes.length === 0) {
    savedSchemesContainer.innerHTML = '';
    noSavedSchemesElement.classList.remove('hidden');
  } else {
    renderSavedSchemes(savedSchemes, savedSchemesContainer);
    noSavedSchemesElement.classList.add('hidden');
  }
}

// Export the loadAndDisplaySavedSchemes function for use in other modules
export { loadAndDisplaySavedSchemes };