// Mobile Menu Handler
document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu elements if they don't exist
    if (!document.querySelector('.mobile-menu-toggle')) {
        // Create mobile menu toggle button
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.setAttribute('aria-label', 'Toggle Menu');
        menuToggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        document.body.appendChild(menuToggle);
        
        // Create mobile overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        
        // Get sidebar
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebar) {
            // Toggle menu on button click
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('active');
                menuToggle.classList.toggle('active');
                overlay.classList.toggle('active');
                document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
            });
            
            // Close menu when clicking overlay
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('active');
                menuToggle.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            // Close menu when clicking a nav link
            const navLinks = sidebar.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('active');
                        menuToggle.classList.remove('active');
                        overlay.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            });
            
            // Handle window resize
            let resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    if (window.innerWidth > 768) {
                        sidebar.classList.remove('active');
                        menuToggle.classList.remove('active');
                        overlay.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }, 250);
            });
        }
    }
});
