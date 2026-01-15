import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const registerForm = document.getElementById('register-form');
const submitBtn = document.getElementById('submit-btn');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const status = document.getElementById('status').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';

    try {
        // 1. Create User in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Save Profile to Firestore
        await setDoc(doc(db, "users", user.uid), {
            fullName: fullName,
            email: email,
            status: status,
            createdAt: new Date()
        });

        alert('Registrasi Berhasil! Selamat Datang.');
        window.location.href = 'evaluasi.html';

    } catch (error) {
        console.error("Register Error:", error);

        let errorMessage = "Gagal Registrasi. Silakan coba lagi.";

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Email ini sudah terdaftar. Silakan gunakan email lain atau Login.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "Password terlalu lemah. Masukkan minimal 6 karakter.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Format email tidak valid.";
        } else if (error.message) {
            errorMessage = "Gagal: " + error.message;
        }

        alert(errorMessage);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Daftar Akun';
    }
});
