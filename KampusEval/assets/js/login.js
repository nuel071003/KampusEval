import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('login-form');
const submitBtn = document.getElementById('submit-btn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Memverifikasi...';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'evaluasi.html';
    } catch (error) {
        console.error("Login Error:", error);
        alert('Gagal Login: Email atau Password salah.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Masuk';
    }
});
