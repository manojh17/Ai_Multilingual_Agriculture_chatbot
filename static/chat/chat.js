/**
 * Chat functionality for the agricultural chatbot
 */

// Chat state
let messages = [];
let isProcessingMessage = false;

// Initialize chat functionality
function initChat() {
  const chatWindow = document.getElementById('chatWindow');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');

  if (!chatWindow || !userInput || !sendButton) {
    console.error('Chat elements not found');
    return;
  }

  // Auto-resize input
  userInput.addEventListener('input', () => autoResizeTextarea(userInput));

  // Send message on button click
  sendButton.addEventListener('click', sendUserMessage);

  // Send message on Enter key
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendUserMessage();
    }
  });

  // Add fade effect
  setupChatWindowFade(chatWindow);

  // Focus input
  setTimeout(() => userInput.focus(), 500);
}

// Send user's message
function sendUserMessage() {
  const userInput = document.getElementById('userInput');
  const chatWindow = document.getElementById('chatWindow');

  if (!userInput || !chatWindow) return;

  const message = userInput.value.trim();
  if (!message || isProcessingMessage) return;

  userInput.value = '';
  userInput.style.height = 'auto';

  addMessageToChat('user', message);
  processMessage(message);
}

// Call backend API for a response
function processMessage(message) {
  isProcessingMessage = true;

  fetch('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message })
  })
    .then(response => {
      if (!response.ok) throw new Error('Network error');
      return response.json();
    })
    .then(data => {
      const reply = data.response || "Sorry, I couldn't understand that.";
      addMessageToChat('bot', reply);

      if (isSpeakerEnabled()) {
        speakText(reply);
      }
    })
    .catch(error => {
      console.error('Backend error:', error);
      addMessageToChat('bot', "⚠️ Unable to connect to the server. Please try again.");
    })
    .finally(() => {
      isProcessingMessage = false;
    });
}

// Add a message to the chat UI
function addMessageToChat(sender, text) {
  const chatWindow = document.getElementById('chatWindow');
  if (!chatWindow) return;

  const messageContainer = document.createElement('div');
  messageContainer.className = `message-container ${sender}-message`;

  const time = formatTimestamp(new Date());

  const messageHTML = sender === 'bot' ? `
    <div class="avatar-container">
      <div class="avatar-icon bot-avatar"></div>
    </div>
    <div class="message-content">
      <div class="message-text">${text}</div>
      <div class="message-timestamp">${time}</div>
    </div>
  ` : `
    <div class="message-content">
      <div class="message-text">${text}</div>
      <div class="message-timestamp">${time}</div>
    </div>
    <div class="avatar-container">
      <div class="avatar-icon user-avatar"></div>
    </div>
  `;

  messageContainer.innerHTML = messageHTML;
  chatWindow.appendChild(messageContainer);

  messages.push({ sender, text, timestamp: new Date() });

  scrollToBottom(chatWindow);
}

// Clear the chat history
function clearChat() {
  const chatWindow = document.getElementById('chatWindow');
  if (!chatWindow) return;

  const welcomeMessage = chatWindow.querySelector('.welcome-message');
  chatWindow.innerHTML = '';

  if (welcomeMessage) {
    chatWindow.appendChild(welcomeMessage);
  }

  messages = [];
}
