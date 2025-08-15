document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('fertilizerForm');
    const predictBtn = document.getElementById('predictBtn');
    const resultDiv = document.getElementById('result');
    
    // Get all input and slider pairs
    const inputSliderPairs = [
        { input: 'Temparature', slider: 'temp-slider', min: 0, max: 50 },
        { input: 'Humidity', slider: 'humidity-slider', min: 0, max: 100 },
        { input: 'Moisture', slider: 'moisture-slider', min: 0, max: 100 },
        { input: 'Nitrogen', slider: 'nitrogen-slider', min: 0, max: 150 },
        { input: 'Potassium', slider: 'potassium-slider', min: 0, max: 150 },
        { input: 'Phosphorous', slider: 'phosphorous-slider', min: 0, max: 150 }
    ];
    
    // Setup input and slider synchronization
    inputSliderPairs.forEach(pair => {
        const input = document.getElementById(pair.input);
        const slider = document.getElementById(pair.slider);
        
        if (input && slider) {
            // Initialize slider value based on input
            input.value = input.value || Math.floor((pair.min + pair.max) / 2);
            slider.value = input.value;
            
            // Update input when slider changes
            slider.addEventListener('input', () => {
                input.value = slider.value;
            });
            
            // Update slider when input changes
            input.addEventListener('input', () => {
                if (input.value < pair.min) input.value = pair.min;
                if (input.value > pair.max) input.value = pair.max;
                slider.value = input.value;
            });
        }
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        const isValid = validateForm();
        
        if (!isValid) {
            e.preventDefault();
            return;
        }
        
        // Show loading state
        predictBtn.classList.add('loading');
        
        // For demonstration purposes (since we can't actually submit)
        // This simulates the form submission behavior
        if (window.location.pathname !== '/soiltesting') {
            e.preventDefault();
            
            // Simulate a server response after 2 seconds
            setTimeout(() => {
                predictBtn.classList.remove('loading');
                
                // Display a sample result
                displayResult("NPK 10-5-10 with Micronutrients");
            }, 2000);
        }
    });
    
    // Function to validate the form
    function validateForm() {
        let isValid = true;
        const requiredInputs = form.querySelectorAll('input[required], select[required]');
        
        requiredInputs.forEach(input => {
            if (!input.value) {
                markInvalid(input);
                isValid = false;
            } else {
                markValid(input);
            }
        });
        
        return isValid;
    }
    
    // Functions to mark inputs as valid or invalid
    function markInvalid(input) {
        input.style.borderColor = 'var(--error-color)';
        input.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.2)';
        
        // Add shake animation
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
        
        input.addEventListener('input', function onInput() {
            markValid(input);
            input.removeEventListener('input', onInput);
        });
    }
    
    function markValid(input) {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    }
    
    // Function to display the result
    function displayResult(fertilizer) {
        const fertilizerName = document.getElementById('fertilizer-name');
        fertilizerName.textContent = fertilizer;
        
        resultDiv.classList.add('show');
        
        // Scroll to the result
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Check if there's already a fertilizer result in the page
    // This handles the server-side template rendering case
    if (resultDiv.textContent.trim() && resultDiv.textContent.includes('{{ fertilizer }}') === false) {
        resultDiv.classList.add('show');
    }
    
    // Add shake animation for invalid inputs
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        
        .shake {
            animation: shake 0.5s ease-in-out;
        }
    `;
    document.head.appendChild(style);
    
    // Add hover effects to sections
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            section.style.transform = 'translateY(-5px)';
        });
        
        section.addEventListener('mouseleave', () => {
            section.style.transform = '';
        });
    });
});