/* =====================================================
   NOTES.JS - Public Leave a Note + Reply System
   Menggunakan Firebase Firestore + Auth (admin)
   ===================================================== */

(function () {
    "use strict";

    const firebaseConfig = {
        apiKey: "AIzaSyBEIuoz6kjsRee3V2rUbXZwiAXO4jB6dSg",
        authDomain: "afgan-id.firebaseapp.com",
        projectId: "afgan-id",
        storageBucket: "afgan-id.firebasestorage.app",
        messagingSenderId: "534933383721",
        appId: "1:534933383721:web:c8a78e8f821a4495c30a38",
        measurementId: "G-YJSRDREDFP"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const NOTES_COLLECTION = "public_notes";

    // DOM
    const notesList = document.getElementById("notes-list");
    const notesCount = document.getElementById("notes-count");
    const form = document.getElementById("note-form");
    const nameInput = document.getElementById("note-name");
    const messageInput = document.getElementById("note-message");
    const charCurrent = document.getElementById("char-current");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoading = submitBtn.querySelector(".btn-loading");
    const formTitle = document.getElementById("form-title");
    const formSubtitle = document.getElementById("form-subtitle");
    const replyingTo = document.getElementById("replying-to");
    const replyNameEl = document.getElementById("reply-name");
    const cancelReplyBtn = document.getElementById("cancel-reply");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");

    let notes = [];
    let replyToId = null;
    let unsubscribe = null;

    let isAdmin = false;
    const ADMIN_EMAIL = "admin@gmail.com"; // ganti dengan email admin kamu
    const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

    /* ---------- Helpers ---------- */
    function getInitials(name) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() || "")
            .join("");
    }

    function timeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 10) return "baru saja";
        if (seconds < 60) return `${seconds} detik lalu`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} menit lalu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} jam lalu`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} hari lalu`;
        return new Date(timestamp).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    function showToast(msg) {
        toastMessage.textContent = msg;
        toast.hidden = false;
        setTimeout(() => {
            toast.hidden = true;
        }, 3200);
    }

    function escapeHTML(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    /* ---------- Firebase ---------- */
    async function ensureOwnerNote() {
        const OWNER_ID = "owner-afgan-pinned";
        const docRef = db.collection(NOTES_COLLECTION).doc(OWNER_ID);
        const doc = await docRef.get();

        if (!doc.exists) {
            await docRef.set({
                id: OWNER_ID,
                name: "AFGAN",
                message: "Halo semua selamat datang😁",
                timestamp: Date.now() - 86400000,
                isOwner: true,
                isPinned: true,
                replies: [],
            });
        }
    }

    function loadNotesRealtime() {
        if (unsubscribe) unsubscribe();
        unsubscribe = db.collection(NOTES_COLLECTION)
            .orderBy("timestamp", "desc")
            .onSnapshot(async (snapshot) => {
                const loadedNotes = snapshot.docs.map((doc) => ({
                    ...doc.data(), id: doc.id, replies: []
                }));
                await Promise.all(loadedNotes.map(async (note) => {
                    const rs = await db.collection(NOTES_COLLECTION).doc(note.id)
                        .collection("replies").orderBy("timestamp", "asc").get();
                    note.replies = rs.docs.map((r) => ({ ...r.data(), id: r.id }));
                }));
                notes = loadedNotes;
                renderNotes();
            }, (error) => {
                console.error("Error loading notes:", error);
                showToast("Gagal memuat catatan");
            });
    }

    /* ---------- Render ---------- */
    function renderNotes() {
        notesList.querySelectorAll(".note-card").forEach((c) => c.remove());

        notesCount.textContent = `${notes.length} catatan`;

        const sorted = [...notes].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.timestamp - a.timestamp;
        });

        sorted.forEach((note) => {
            notesList.appendChild(createNoteCard(note));
        });
    }

    function createNoteCard(note) {
        const card = document.createElement("article");
        card.className = "note-card" + (note.isPinned ? " note-card--pinned" : "");
        card.dataset.id = note.id;

        const repliesHTML = (note.replies || [])
            .map(
                (r) => `
            <div class="reply-item" data-reply-id="${r.id}" data-parent-id="${note.id}">
                <div class="reply-item__avatar">${getInitials(r.name)}</div>
                <div class="reply-item__content">
                    <div class="reply-item__header">
                        <div>
                            <span class="reply-item__name">${escapeHTML(r.name)}</span>
                            <span class="reply-item__time">${timeAgo(r.timestamp)}</span>
                        </div>
                        ${isAdmin ? `
                        <button class="note-delete-btn" data-delete-reply="${r.id}" data-parent="${note.id}" title="Hapus balasan" aria-label="Hapus balasan">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>` : ""}
                    </div>
                    <p class="reply-item__message">${escapeHTML(r.message)}</p>
                </div>
            </div>
        `
            )
            .join("");

        const ownerBadge = note.isOwner
            ? `<span class="note-card__badge">Owner</span>`
            : "";

        const pinIcon = note.isPinned
            ? `<span class="note-card__pin" title="Disematkan">📌</span>`
            : "";

        card.innerHTML = `
            <div class="note-card__header">
                <div class="note-card__avatar">${getInitials(note.name)}</div>
                <div class="note-card__meta">
                    <div class="note-card__name-row">
                        <span class="note-card__name">${escapeHTML(note.name)}</span>
                        ${ownerBadge}
                        ${pinIcon}
                    </div>
                    <div class="note-card__time">${timeAgo(note.timestamp)}</div>
                </div>
                ${isAdmin && !note.isOwner
                ? `<button class="note-delete-btn note-delete-btn--main" data-delete-note="${note.id}" title="Hapus catatan" aria-label="Hapus catatan">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>`
                : ""
            }
            </div>
            <p class="note-card__message">${escapeHTML(note.message)}</p>
            <div class="note-card__actions">
                <button class="note-card__reply-btn" data-reply="${note.id}" data-name="${escapeHTML(note.name)}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Balas
                </button>
            </div>
            ${repliesHTML ? `<div class="note-card__replies">${repliesHTML}</div>` : ""}
        `;

        return card;
    }

    /* ---------- Delete Logic (admin only) ---------- */
    async function deleteNote(id) {
        if (!isAdmin) return showToast("Hanya admin yang bisa menghapus");
        const note = notes.find((n) => n.id === id);
        if (note && note.isOwner) return showToast("Catatan Owner tidak bisa dihapus");
        try {
            // Firestore tidak otomatis menghapus subcollection
            const rs = await db.collection(NOTES_COLLECTION).doc(id).collection("replies").get();
            await Promise.all(rs.docs.map((d) => d.ref.delete()));
            await db.collection(NOTES_COLLECTION).doc(id).delete();
            showToast("Catatan dihapus");
        } catch (err) {
            console.error(err);
            showToast("Gagal menghapus catatan");
        }
    }

    async function deleteReply(parentId, replyId) {
        if (!isAdmin) return showToast("Hanya admin yang bisa menghapus");
        try {
            await db.collection(NOTES_COLLECTION).doc(parentId)
                .collection("replies").doc(replyId).delete();
            showToast("Balasan dihapus");
            loadNotesRealtime();
        } catch (err) {
            console.error("Delete reply error:", err);
            showToast("Gagal menghapus balasan");
        }
    }

    /* ---------- Admin Login / Logout ---------- */
    async function adminLogin(email, password) {
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            showToast("Login admin berhasil");
            return true;
        } catch (error) {
            console.error("Admin login error:", error);
            showToast("Login admin gagal");
            return false;
        }
    }

    function adminLogout() {
        firebase.auth().signOut().then(() => showToast("Logout berhasil"));
    }

    function updateAdminUI() {
        let btn = document.getElementById("admin-logout-btn");
        if (isAdmin && !btn) {
            btn = document.createElement("button");
            btn.id = "admin-logout-btn";
            btn.type = "button";
            btn.textContent = "Logout Admin";
            btn.style.cssText = "margin-top:8px;padding:4px 10px;border-radius:8px;cursor:pointer;";
            btn.addEventListener("click", adminLogout);
            formSubtitle.after(btn);
        } else if (!isAdmin && btn) {
            btn.remove();
        }
    }

    firebase.auth().onAuthStateChanged((user) => {
        isAdmin = !!user && user.email === ADMIN_EMAIL;
        updateAdminUI();
        renderNotes();
        if (isAdmin) ensureOwnerNote().catch(console.error);
    });

    /* ---------- Form Logic ---------- */
    function setReplyMode(id, name) {
        replyToId = id;
        replyNameEl.textContent = name;
        replyingTo.hidden = false;
        formTitle.textContent = "Balas Catatan";
        formSubtitle.textContent = `Membalas pesan dari ${name}`;
        messageInput.focus();
    }

    function clearReplyMode() {
        replyToId = null;
        replyingTo.hidden = true;
        formTitle.textContent = "Tulis Catatan";
        formSubtitle.textContent = "Pesanmu akan tampil di sisi kiri";
    }

    messageInput.addEventListener("input", () => {
        const len = messageInput.value.length;
        charCurrent.textContent = len;
        const counter = charCurrent.parentElement;
        counter.classList.toggle("warning", len > 400);
        counter.classList.toggle("danger", len > 480);
    });

    cancelReplyBtn.addEventListener("click", clearReplyMode);

    notesList.addEventListener("click", (e) => {
        const replyBtn = e.target.closest("[data-reply]");
        if (replyBtn) {
            setReplyMode(replyBtn.dataset.reply, replyBtn.dataset.name);
            return;
        }

        const deleteNoteBtn = e.target.closest("[data-delete-note]");
        if (deleteNoteBtn) {
            const id = deleteNoteBtn.dataset.deleteNote;
            if (confirm("Yakin ingin menghapus catatan ini?")) {
                deleteNote(id);
            }
            return;
        }

        const deleteReplyBtn = e.target.closest("[data-delete-reply]");
        if (deleteReplyBtn) {
            const replyId = deleteReplyBtn.dataset.deleteReply;
            const parentId = deleteReplyBtn.dataset.parent;
            if (confirm("Yakin ingin menghapus balasan ini?")) {
                deleteReply(parentId, replyId);
            }
        }
    });

    // Submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) {
            showToast("Nama dan catatan wajib diisi");
            return;
        }

        // ===== Mode login admin: Nama = email, Catatan = password =====
        if (isEmail(name) && !replyToId) {
            submitBtn.disabled = true;
            const ok = await adminLogin(name, messageInput.value); // password tidak di-trim
            submitBtn.disabled = false;
            if (ok) {
                form.reset();
                charCurrent.textContent = "0";
            }
            return; // tidak pernah dikirim sebagai catatan
        }

        submitBtn.disabled = true;
        btnText.hidden = true;
        btnLoading.hidden = false;

        const isReplying = !!replyToId;
        const currentReplyToId = replyToId;

        try {
            if (currentReplyToId) {
                const replyRef = db
                    .collection(NOTES_COLLECTION)
                    .doc(currentReplyToId)
                    .collection("replies")
                    .doc();

                await replyRef.set({
                    id: replyRef.id,
                    name,
                    message,
                    timestamp: Date.now()
                });

                loadNotesRealtime();
            } else {
                const newRef = db.collection(NOTES_COLLECTION).doc();

                await newRef.set({
                    id: newRef.id,
                    name,
                    message,
                    timestamp: Date.now(),
                    isOwner: false,
                    isPinned: false,
                    replies: []
                });
            }

            form.reset();
            charCurrent.textContent = "0";
            clearReplyMode();
            showToast(isReplying ? "Balasan berhasil dikirim!" : "Catatan berhasil dikirim!");
            notesList.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error(err);
            showToast("Gagal mengirim catatan");
        } finally {
            submitBtn.disabled = false;
            btnText.hidden = false;
            btnLoading.hidden = true;
        }
    });

    /* ---------- Init ---------- */
    function init() {
        loadNotesRealtime(); // tidak bergantung pada ensureOwnerNote
    }

    init();
})();