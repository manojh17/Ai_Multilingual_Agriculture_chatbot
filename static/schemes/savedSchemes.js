// Saved Schemes Management
import { getTranslation, getCurrentLanguage } from './language.js';
import { removeSavedScheme } from './storage.js';
import { loadAndDisplaySavedSchemes } from './main.js';

// Render saved schemes
export function renderSavedSchemes(schemes, container) {
  // Clear container
  container.innerHTML = '';
  
  // Current language
  const lang = getCurrentLanguage();
  
  // If no saved schemes, show message
  if (!schemes || schemes.length === 0) {
    return;
  }
  
  // Render each saved scheme
  schemes.forEach(scheme => {
    const schemeCard = document.createElement('div');
    schemeCard.className = 'scheme-card fade-in';
    
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
        <button class="btn btn-remove" data-scheme-id="${scheme.id}">${getTranslation('remove')}</button>
      </div>
    `;
    
    // Add the card to the container
    container.appendChild(schemeCard);
    
    // Add event listener to remove button
    const removeButton = schemeCard.querySelector('.btn-remove');
    removeButton.addEventListener('click', function() {
      const schemeId = this.getAttribute('data-scheme-id');
      
      // Remove the scheme from localStorage
      removeSavedScheme(schemeId);
      
      // Add shake animation to the card before removal
      schemeCard.classList.add('shake');
      
      // Remove the card after animation completes
      setTimeout(() => {
        // Refresh saved schemes display
        loadAndDisplaySavedSchemes();
      }, 600);
    });
  });
}