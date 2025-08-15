/**
 * Utility functions for the agricultural chatbot
 */

// Format a timestamp (e.g., 4:30 PM)
function formatTimestamp(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Auto-resize textarea height based on content
function autoResizeTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto'; // reset first
  const newHeight = Math.min(textarea.scrollHeight, 120); // max-height controlled by CSS
  textarea.style.height = newHeight + 'px';
}

// Scroll an element to the bottom (e.g., chat window)
function scrollToBottom(element) {
  if (!element) return;
  element.scrollTop = element.scrollHeight;
}

// Debounce a function call (e.g., on input)
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Apply fade background fallback if backdrop-filter is unsupported
function setupChatWindowFade(chatWindow) {
  if (!chatWindow) return;

  const supportsBackdropFilter =
    'backdropFilter' in document.documentElement.style ||
    'webkitBackdropFilter' in document.documentElement.style;

  if (!supportsBackdropFilter) {
    chatWindow.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
  }
}

// Get a DOM element safely
function $(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    console.error(`Element not found for selector: ${selector}`);
  }
  return element;
}

// Toggle class safely (with optional force mode)
function toggleClass(element, className, force) {
  if (!element || !className) return;

  if (force === undefined) {
    element.classList.toggle(className);
  } else {
    element.classList[force ? 'add' : 'remove'](className);
  }
}

// Button press animation effect
function addButtonEffects(button) {
  if (!button) return;

  button.addEventListener('mousedown', () => {
    button.style.transform = 'scale(0.95)';
  });

  button.addEventListener('mouseup', () => {
    button.style.transform = '';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = '';
  });
}
