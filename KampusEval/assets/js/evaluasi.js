import { auth, db } from './firebase-config.js';
import { collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const evalForm = document.getElementById('evaluation-form');
const submitBtn = document.getElementById('submit-btn');

// Cloudinary Configuration (Replace with your actual settings)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxvuyjzux/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "wsflvtsg";

evalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = 'login.html';
        return;
    }

    const evaluatorName = document.getElementById('evaluator-name').value;
    const evaluatorInstitution = document.getElementById('evaluator-institution').value;
    const evaluatorRole = document.getElementById('evaluator-role').value;
    const activity = document.getElementById('activity').value;
    const activityDetails = document.getElementById('activity-details').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const feedback = document.getElementById('feedback').value;
    const docFile = document.getElementById('documentation').files[0];

    if (!rating) {
        alert("Pilih rating terlebih dahulu.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    try {
        let docUrl = "";

        // 1. Upload to Cloudinary if file exists
        if (docFile) {
            const formData = new FormData();
            formData.append('file', docFile);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Gagal mengunggah ke Cloudinary.");

            const cloudData = await response.json();
            docUrl = cloudData.secure_url;
        }

        // Fetch user role for verification (optional, but good for data integrity)
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : { role: 'umum' };

        // 2. Save to Firestore
        await addDoc(collection(db, "evaluations"), {
            userId: auth.currentUser.uid,
            userName: userData.fullName || auth.currentUser.displayName || auth.currentUser.email,
            userEmail: auth.currentUser.email,
            userRole: userData.role || 'umum',
            evaluatorName: evaluatorName,
            evaluatorInstitution: evaluatorInstitution,
            evaluatorRole: evaluatorRole,
            activity: activity,
            activityDetails: activityDetails,
            rating: parseInt(rating),
            feedback: feedback,
            documentationUrl: docUrl,
            submittedAt: new Date()
        });

        alert("Evaluasi berhasil dikirim! Terima kasih.");
        evalForm.reset();
        // Reset stars visual (CSS handle it now with radio checked status, but good to ensure UI is fresh)

    } catch (error) {
        console.error("Submission Error:", error);
        alert("Gagal mengirim evaluasi: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Evaluasi';
    }
});
