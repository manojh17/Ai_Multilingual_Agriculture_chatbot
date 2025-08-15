// Animation Related Functions

// Initialize all animations
export function initAnimations() {
  // Add fade-in class to elements that should animate in
  const elementsToAnimate = document.querySelectorAll('.hero, .profile-card, .section-title');
  
  elementsToAnimate.forEach(element => {
    element.classList.add('fade-in');
  });
  
  // Add event listeners for interactive elements
  addButtonAnimations();
  
  // Initialize scroll animations
  initScrollAnimations();
}

// Add animations to buttons
function addButtonAnimations() {
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    // Add transition classes
    button.classList.add('transition-transform');
    
    // MouseOver animation
    button.addEventListener('mouseover', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    // MouseOut animation
    button.addEventListener('mouseout', function() {
      this.style.transform = 'translateY(0)';
    });
    
    // Click animation
    button.addEventListener('click', function() {
      this.classList.add('pulse');
      
      // Remove animation class after it completes
      setTimeout(() => {
        this.classList.remove('pulse');
      }, 2000);
    });
  });
}

// Initialize scroll animations
function initScrollAnimations() {
  // Only run if Intersection Observer is supported
  if ('IntersectionObserver' in window) {
    const options = {
      root: null, // Use viewport as root
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% of element is visible
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in');
          observer.unobserve(entry.target); // Stop observing once animation is triggered
        }
      });
    }, options);
    
    // Observe all scheme cards
    const schemeCards = document.querySelectorAll('.scheme-card');
    schemeCards.forEach(card => {
      observer.observe(card);
    });
  }
}

// Export utility functions for use in other modules
export function addFadeInAnimation(element) {
  element.classList.add('fade-in');
}

export function addSlideInAnimation(element) {
  element.classList.add('slide-in');
}

export function addBounceAnimation(element) {
  element.classList.add('bounce');
  
  // Remove animation class after it completes
  setTimeout(() => {
    element.classList.remove('bounce');
  }, 2000);
}

export function addShakeAnimation(element) {
  element.classList.add('shake');
  
  // Remove animation class after it completes
  setTimeout(() => {
    element.classList.remove('shake');
  }, 600);
}