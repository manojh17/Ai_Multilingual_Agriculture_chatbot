document.addEventListener('DOMContentLoaded', function() {
  // Add loading animation to submit button
  const form = document.getElementById('harvest-form');
  const submitBtn = form ? form.querySelector('.submit-btn') : null;
  
  if (form && submitBtn) {
    form.addEventListener('submit', function(event) {
      // Don't prevent default as we want the form to submit normally
      
      // Add loading state
      submitBtn.classList.add('loading');
      submitBtn.setAttribute('disabled', true);
      
      // Remove loading state after 2 seconds if for some reason the page doesn't refresh
      setTimeout(function() {
        if (document.body.contains(submitBtn)) {
          submitBtn.classList.remove('loading');
          submitBtn.removeAttribute('disabled');
        }
      }, 2000);
    });
  }
  
  // Add subtle animation to result containers
  const resultContainers = document.querySelectorAll('.result');
  resultContainers.forEach(function(container, index) {
    // Stagger the animation for multiple results
    container.style.animationDelay = (index * 0.15) + 's';
  });
  
  // Input focus effects
  const inputs = document.querySelectorAll('input');
  inputs.forEach(function(input) {
    const wrapper = input.closest('.input-wrapper');
    if (wrapper) {
      input.addEventListener('focus', function() {
        wrapper.classList.add('focus');
      });
      
      input.addEventListener('blur', function() {
        wrapper.classList.remove('focus');
      });
    }
  });
  
  // Add hover effect to the logo
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('mouseover', function() {
      this.style.transform = 'rotate(10deg) scale(1.1)';
    });
    
    logo.addEventListener('mouseout', function() {
      this.style.transform = 'rotate(0) scale(1)';
    });
  }
});