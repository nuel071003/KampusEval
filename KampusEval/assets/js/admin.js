import { auth, db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const tableBody = document.getElementById('admin-table-body');
const searchInput = document.getElementById('admin-search');
const btnExcel = document.getElementById('export-excel');
const btnPdf = document.getElementById('export-pdf');

let allEvaluations = [];

// 1. Protection: Check if Admin
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        alert("Akses ditolak. Ini adalah area khusus Admin.");
        window.location.href = 'index.html';
    } else {
        fetchEvaluations();
    }
});

// 2. Fetch Data
function fetchEvaluations() {
    const q = query(collection(db, "evaluations"), orderBy("submittedAt", "desc"));

    onSnapshot(q, (snapshot) => {
        allEvaluations = [];
        tableBody.innerHTML = '';

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada data evaluasi.</td></tr>';
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            allEvaluations.push({ id: doc.id, ...data });
        });

        renderTable(allEvaluations);
    });
}

// 3. Render Table
function renderTable(data) {
    tableBody.innerHTML = '';
    data.forEach((evalItem) => {
        const date = evalItem.submittedAt?.toDate().toLocaleString('id-ID') || "N/A";
        const roleClass = `badge-${evalItem.userRole?.toLowerCase() || 'umum'}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-size: 0.85rem; color: var(--text-secondary);">${date}</td>
            <td>
                <div style="font-weight: 600;">${evalItem.evaluatorName || evalItem.userName || 'Anonymous'}</div>
                <span class="badge ${roleClass}">${evalItem.evaluatorRole || evalItem.userRole || 'Umum'}</span>
            </td>
            <td>${evalItem.evaluatorInstitution || '-'}</td>
            <td style="font-weight: 500;">${evalItem.activity}</td>
            <td style="color: #fbbf24;">${'★'.repeat(evalItem.rating)}${'☆'.repeat(5 - evalItem.rating)}</td>
            <td style="font-size: 0.9rem; max-width: 300px;">${evalItem.feedback}</td>
            <td>
                ${evalItem.documentationUrl ? `<a href="${evalItem.documentationUrl}" target="_blank" class="btn btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Lihat Foto</a>` : '<span style="color: #cbd5e1;">N/A</span>'}
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// 4. Search Filter
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allEvaluations.filter(ev =>
        ev.activity.toLowerCase().includes(term) ||
        ev.userName.toLowerCase().includes(term) ||
        ev.feedback.toLowerCase().includes(term)
    );
    renderTable(filtered);
});

// 5. Export to Excel
btnExcel.addEventListener('click', () => {
    const worksheet = XLSX.utils.json_to_sheet(allEvaluations.map(ev => ({
        Tanggal: ev.submittedAt?.toDate().toLocaleString('id-ID'),
        Nama: ev.evaluatorName || ev.userName,
        Role: ev.evaluatorRole || ev.userRole,
        Instansi: ev.evaluatorInstitution || '-',
        Kegiatan: ev.activity,
        Isi_Kegiatan: ev.activityDetails,
        Rating: ev.rating,
        Pesan: ev.feedback,
        Foto: ev.documentationUrl
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluasi");
    XLSX.writeFile(workbook, "Laporan_Evaluasi_KampusEval.xlsx");
});

// 6. Export to PDF
btnPdf.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Laporan Evaluasi Kegiatan - KampusEval", 14, 15);

    const tableData = allEvaluations.map(ev => [
        ev.submittedAt?.toDate().toLocaleString('id-ID'),
        `${ev.evaluatorName || ev.userName} (${ev.evaluatorRole || ev.userRole})`,
        ev.evaluatorInstitution || '-',
        ev.activity,
        ev.rating,
        ev.feedback
    ]);

    doc.autoTable({
        head: [['Waktu', 'Nama & Role', 'Instansi', 'Kegiatan', 'Rating', 'Pesan']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillStyle: '#0f172a' }
    });

    doc.save("Laporan_Evaluasi_KampusEval.pdf");
});
