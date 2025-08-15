// Sidebar Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    
    // Mobile Menu Elements
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    // Toggle Sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('active');
    }
    
    // Toggle Mobile Menu
    function toggleMobileMenu() {
        mobileMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    }
    
    // Close Sidebar on Link Click
    function closeSidebarOnClick() {
        sidebar.classList.remove('active');
    }
    
    // Add Scrolled Class to Navbar
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Event Listeners
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', toggleSidebar);
    }
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && event.target !== sidebarToggle && sidebar.classList.contains('active')) {
            closeSidebarOnClick();
        }
        
        if (!mobileMenu.contains(event.target) && event.target !== mobileMenuToggle && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
    
    // Close sidebar when clicking on a link
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebarOnClick);
    });
    
    // Scroll event for navbar
    window.addEventListener('scroll', handleScroll);
    
    // Initialize navbar state on load
    handleScroll();
});