import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const authButtons = document.getElementById('auth-buttons');
const userProfile = document.getElementById('user-profile');
const userNameDisplay = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const evaluasiLink = document.getElementById('evaluasi-link');

// Monitor Authentication State
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (evaluasiLink) evaluasiLink.style.display = 'block';

        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userOnlyLinks = document.querySelectorAll('.user-only');

        // Sembunyikan menu Beranda, Tentang, Panduan, Kontak untuk SEMUA user yang login
        userOnlyLinks.forEach(link => link.style.display = 'none');

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userNameDisplay) userNameDisplay.textContent = userData.fullName || user.email;

            // Link Admin
            const adminLink = document.getElementById('admin-link');
            if (userData.role === 'admin') {
                if (adminLink) adminLink.style.display = 'block';
            } else {
                if (adminLink) adminLink.style.display = 'none';
            }
        } else {
            if (userNameDisplay) userNameDisplay.textContent = user.email;
        }
    } else {
        // User is signed out
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
        if (evaluasiLink) evaluasiLink.style.display = 'none';

        // Protected Page Handling
        const protectedPages = ['evaluasi.html', 'admin.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
});

// Logout Handler
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });
}
// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const navContent = document.querySelector('.nav-content');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');

    if (navContent && navLinks) {
        // Cek jika sudah ada toggle agar tidak duplikat
        if (!document.getElementById('menu-toggle')) {
            const menuToggle = document.createElement('div');
            menuToggle.className = 'menu-toggle';
            menuToggle.id = 'menu-toggle';
            menuToggle.innerHTML = '<span></span><span></span><span></span>';

            navContent.insertBefore(menuToggle, authButtons || userProfile);

            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('is-active');

                // Animasi Hamburger
                const spans = menuToggle.querySelectorAll('span');
                if (navLinks.classList.contains('active')) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
                } else {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            });

            // Tutup menu jika klik link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    const spans = menuToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                });
            });
        }
    }
});
