// Main JavaScript file - initialization and coordinating functionality
document.addEventListener('DOMContentLoaded', function() {
    // Application state
    const appState = {
        // Whether the application is ready for interaction
        isReady: false,
        
        // Current language
        language: 'en',
        
        // Dark mode flag (for future implementation)
        darkMode: false,
        
        // Whether notifications are enabled
        notificationsEnabled: false
    };
    
    // Initialize the application
    function initApp() {
        // Show page loader while resources load
        showPageLoader();
        
        // Check for dark mode preference
        checkDarkModePreference();
        
        // Check for notification permission
        checkNotificationPermission();
        
        // Load user preferences from localStorage
        loadUserPreferences();
        
        // Remove page loader once everything is loaded
        window.addEventListener('load', hidePageLoader);
        
        // Set app as ready
        appState.isReady = true;
        
        // Console welcome message
        console.log('Welcome to AgroTech! Application initialized successfully.');
    }
    
    // Page loader functions
    function showPageLoader() {
        // For now, we'll just use CSS animations in the page itself
        document.body.classList.add('loading');
    }
    
    function hidePageLoader() {
        document.body.classList.remove('loading');
        
        // Trigger entrance animations
        triggerEntranceAnimations();
    }
    
    // Trigger animations when page is loaded
    function triggerEntranceAnimations() {
        // This is now handled by our animation system
    }
    
    // Check dark mode preference
    function checkDarkModePreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            appState.darkMode = true;
            // For future implementation
            // document.body.classList.add('dark-mode');
        }
        
        // Listen for changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            appState.darkMode = event.matches;
            // For future implementation
            // document.body.classList.toggle('dark-mode', event.matches);
        });
    }
    
    // Check for notification permission
    function checkNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                appState.notificationsEnabled = true;
            }
        }
    }
    
    // Request notification permission
    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    appState.notificationsEnabled = true;
                    showNotification('Notifications enabled', 'You will now receive updates about your crops and agricultural alerts.');
                }
            });
        }
    }
    
    // Show a notification
    function showNotification(title, body) {
        if ('Notification' in window && appState.notificationsEnabled) {
            const notification = new Notification(title, {
                body: body,
                icon: '/images/logo.png' // Would be added in a full implementation
            });
            
            notification.onclick = function() {
                window.focus();
                notification.close();
            };
        }
    }
    
    // Load user preferences
    function loadUserPreferences() {
        // Check for language preference
        const preferredLanguage = localStorage.getItem('preferred_language');
        if (preferredLanguage) {
            appState.language = preferredLanguage;
        }
        
        // Load other preferences here
    }
    
    // Initialize the app
    initApp();
    
    // Optional: Demo weather alert feature
    // setTimeout(function() {
    //     if (appState.notificationsEnabled) {
    //         showNotification('Weather Alert', 'Heavy rain expected in your area tomorrow. Consider delaying any planned spraying activities.');
    //     }
    // }, 10000);
});