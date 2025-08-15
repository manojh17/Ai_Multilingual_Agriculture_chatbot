document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const submitBtn = form.querySelector('.submit-btn');

    form.addEventListener('submit', function(e) {
        // Only add loading state if not actually submitting to server
        if (window.location.pathname !== '/register') {
            e.preventDefault();
            
            // Add loading state
            submitBtn.classList.add('loading');
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.classList.remove('loading');
            }, 2000);
        }
    });

    // Add floating label effect
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });

        // Check initial state
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
});