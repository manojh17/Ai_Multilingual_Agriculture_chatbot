/**
 * Main application script for the agricultural chatbot
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize core components
  initTranslations();
  initChat();
  initSpeech();

  // Add click animations to all buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(addButtonEffects);

  const userInput = document.getElementById('userInput');

  if (userInput) {
    // Auto-resize input on load
    autoResizeTextarea(userInput);

    // Auto-resize on typing (with debounce)
    userInput.addEventListener('input', debounce(function () {
      autoResizeTextarea(this);
    }, 100));
  }

  // Adjust chat window for device height
  adjustChatWindowHeight();
  window.addEventListener('resize', debounce(adjustChatWindowHeight, 200));

  // Enable PWA support (optional)
  registerServiceWorker();
});

/**
 * Adjust chat window height for responsive layout
 */
function adjustChatWindowHeight() {
  const chatWindow = document.getElementById('chatWindow');
  const chatControls = document.querySelector('.chat-controls');
  const chatbotHeader = document.querySelector('.chatbot-header');

  if (!chatWindow || !chatControls || !chatbotHeader) return;

  const availableHeight = window.innerHeight -
    chatControls.offsetHeight -
    chatbotHeader.offsetHeight -
    100; // buffer/padding

  const minHeight = 200;
  chatWindow.style.height = Math.max(availableHeight, minHeight) + 'px';
}

/**
 * Register a service worker (for offline support)
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Uncomment and add sw.js if needed
    /*
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
    */
  }
}

/**
 * Prevent pinch zoom on mobile devices (UX improvement)
 */
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});
