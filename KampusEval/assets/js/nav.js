// Mobile Navigation Logic

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.getElementById('auth-buttons'); // Login/Register container
    const userProfile = document.getElementById('user-profile'); // Logged in profile container
    const navContent = document.querySelector('.nav-content');

    // Function to handle responsive layout
    function handleResponsiveLayout() {
        if (window.innerWidth <= 768) {
            // Mobile: Move buttons inside nav-links if not already there
            if (authButtons && authButtons.parentElement !== navLinks) {
                const li = document.createElement('li');
                li.className = 'mobile-auth-item';
                li.appendChild(authButtons);
                navLinks.appendChild(li);
                authButtons.style.display = 'flex'; // Ensure visible
                authButtons.style.flexDirection = 'column';
                authButtons.style.gap = '1rem';
                authButtons.style.marginTop = '1rem';
                authButtons.style.width = '100%';
            }
            if (userProfile && userProfile.parentElement !== navLinks) {
                const li = document.createElement('li');
                li.className = 'mobile-profile-item';
                li.appendChild(userProfile);
                navLinks.appendChild(li);
                userProfile.style.display = 'flex';
                userProfile.style.flexDirection = 'column';
                userProfile.style.gap = '1rem';
                userProfile.style.marginTop = '1rem';
                userProfile.style.width = '100%';
            }
        } else {
            // Desktop: Move buttons back to nav-content
            const mobileAuthItem = document.querySelector('.mobile-auth-item');
            if (mobileAuthItem && authButtons) {
                navContent.appendChild(authButtons);
                mobileAuthItem.remove();
                authButtons.style = ''; // Reset styles
                // Restore original display logic (handled by auth.js usually, but we reset to flex/none logic)
                // auth.js will manage the display block/none based on state
            }
            const mobileProfileItem = document.querySelector('.mobile-profile-item');
            if (mobileProfileItem && userProfile) {
                navContent.appendChild(userProfile);
                mobileProfileItem.remove();
                userProfile.style = '';
                // auth.js manages visibility (display: none or flex)
                userProfile.style.display = 'none'; // Default hidden until auth.js enables it
            }
        }
    }

    // specific fix for auth buttons visibility in desktop if auth.js ran before
    // We trust auth.js to set the correct display property for the specialized containers

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animate hamburger
            const spans = menuToggle.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });
    }

    // Listen for resize
    window.addEventListener('resize', handleResponsiveLayout);

    // Initial check
    handleResponsiveLayout();
});
