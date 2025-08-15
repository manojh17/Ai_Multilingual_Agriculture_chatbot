// Animation and scroll effects
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS-like scroll animations
    function initScrollAnimations() {
        const elements = document.querySelectorAll('[data-aos]');
        
        // Create observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('aos-animate');
                        // Optionally unobserve after animation
                        // observer.unobserve(entry.target);
                    } else {
                        // Uncomment to re-run animation every time element enters viewport
                        // entry.target.classList.remove('aos-animate');
                    }
                });
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
                rootMargin: '0px 0px -10% 0px' // Slightly offset from bottom
            }
        );
        
        // Observe all elements with data-aos attribute
        elements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Smooth scrolling for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                // Skip empty links and sidebar toggle
                if (targetId === '#' || this.classList.contains('sidebar-toggle')) {
                    return;
                }
                
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Get navbar height for offset
                    const navbar = document.querySelector('.navbar');
                    const navbarHeight = navbar ? navbar.offsetHeight : 0;
                    
                    // Calculate position to scroll to
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                    
                    // Scroll smoothly
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without scrolling
                    history.pushState(null, null, targetId);
                }
            });
        });
    }
    
    // Initialize animations
    initScrollAnimations();
    initSmoothScroll();
    
    // Parallax scrolling effect for hero section
    function initParallax() {
        const hero = document.querySelector('.hero');
        if (hero) {
            window.addEventListener('scroll', function() {
                const scrollPosition = window.pageYOffset;
                hero.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
            });
        }
    }
    
    // Optional: Initialize parallax
    // initParallax();
});