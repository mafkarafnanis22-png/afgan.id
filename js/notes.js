/* =====================================================
   NOTES.JS - Public Leave a Note + Reply System
   ===================================================== */

(function () {
    "use strict";

    const STORAGE_KEY = "afgn_public_notes";

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

    /* ---------- Helpers ---------- */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

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

    /* ---------- Storage ---------- */
    function loadNotes() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            notes = raw ? JSON.parse(raw) : [];
        } catch {
            notes = [];
        }

        // Pastikan catatan Owner selalu ada & disematkan di paling atas
        ensureOwnerNote();
    }

    function ensureOwnerNote() {
        const OWNER_ID = "owner-afgan-pinned";
        const existing = notes.find((n) => n.id === OWNER_ID);

        if (!existing) {
            notes.unshift({
                id: OWNER_ID,
                name: "AFGAN",
                message: "Halo semua selamat datang😁",
                timestamp: Date.now() - 86400000, // 1 hari yang lalu agar terlihat natural
                isOwner: true,
                isPinned: true,
                replies: [],
            });
            saveNotes();
        } else {
            // Pastikan properti owner tetap ada
            existing.isOwner = true;
            existing.isPinned = true;
            existing.name = "AFGAN";
            existing.message = "Halo semua selamat datang😁";
        }
    }

    function saveNotes() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    /* ---------- Render ---------- */
    function renderNotes() {
        // Hapus semua card yang ada
        notesList.querySelectorAll(".note-card").forEach((c) => c.remove());

        const total = notes.length;
        notesCount.textContent = `${total} catatan`;

        // Urutkan: pinned dulu, lalu terbaru
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
                        <button class="note-delete-btn" data-delete-reply="${r.id}" data-parent="${note.id}" title="Hapus balasan" aria-label="Hapus balasan">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
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
                ${!note.isOwner
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

    /* ---------- Delete Logic ---------- */
    function deleteNote(id) {
        // Jangan biarkan hapus owner note
        const note = notes.find((n) => n.id === id);
        if (note && note.isOwner) {
            showToast("Catatan Owner tidak bisa dihapus");
            return;
        }

        notes = notes.filter((n) => n.id !== id);
        saveNotes();
        renderNotes();
        showToast("Catatan dihapus");
    }

    function deleteReply(parentId, replyId) {
        const parent = notes.find((n) => n.id === parentId);
        if (!parent || !parent.replies) return;

        parent.replies = parent.replies.filter((r) => r.id !== replyId);
        saveNotes();
        renderNotes();
        showToast("Balasan dihapus");
    }

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

    // Character counter
    messageInput.addEventListener("input", () => {
        const len = messageInput.value.length;
        charCurrent.textContent = len;
        const counter = charCurrent.parentElement;
        counter.classList.toggle("warning", len > 400);
        counter.classList.toggle("danger", len > 480);
    });

    // Cancel reply
    cancelReplyBtn.addEventListener("click", clearReplyMode);

    // Event delegation untuk reply & delete
    notesList.addEventListener("click", (e) => {
        // Reply
        const replyBtn = e.target.closest("[data-reply]");
        if (replyBtn) {
            setReplyMode(replyBtn.dataset.reply, replyBtn.dataset.name);
            return;
        }

        // Delete note
        const deleteNoteBtn = e.target.closest("[data-delete-note]");
        if (deleteNoteBtn) {
            const id = deleteNoteBtn.dataset.deleteNote;
            if (confirm("Yakin ingin menghapus catatan ini?")) {
                deleteNote(id);
            }
            return;
        }

        // Delete reply
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
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) {
            showToast("Nama dan catatan wajib diisi");
            return;
        }

        submitBtn.disabled = true;
        btnText.hidden = true;
        btnLoading.hidden = false;

        setTimeout(() => {
            if (replyToId) {
                const parent = notes.find((n) => n.id === replyToId);
                if (parent) {
                    if (!parent.replies) parent.replies = [];
                    parent.replies.push({
                        id: generateId(),
                        name,
                        message,
                        timestamp: Date.now(),
                    });
                }
            } else {
                notes.push({
                    id: generateId(),
                    name,
                    message,
                    timestamp: Date.now(),
                    replies: [],
                });
            }

            saveNotes();
            renderNotes();

            form.reset();
            charCurrent.textContent = "0";
            clearReplyMode();

            submitBtn.disabled = false;
            btnText.hidden = false;
            btnLoading.hidden = true;

            showToast(replyToId ? "Balasan berhasil dikirim!" : "Catatan berhasil dikirim!");
            notesList.scrollTo({ top: 0, behavior: "smooth" });
        }, 450);
    });

    /* ---------- Init ---------- */
    loadNotes();
    renderNotes();
})();

// SERTIF JS

/* ===== AWARD MODAL ===== */
(function () {
    const modal = document.getElementById("award-modal");
    const modalImg = document.getElementById("award-modal-img");
    const modalTitle = document.getElementById("award-modal-title");
    const modalDesc = document.getElementById("award-modal-desc");
    const grid = document.getElementById("award-grid");

    if (!modal || !grid) return;

    function openModal(card) {
        const img = card.querySelector("img");
        const title = card.querySelector(".award-card__title");
        const desc = card.querySelector(".award-card__desc");

        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modalTitle.textContent = title ? title.textContent : "";
        modalDesc.textContent = desc ? desc.textContent : "";

        modal.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
    }

    // Klik kartu atau tombol preview
    grid.addEventListener("click", (e) => {
        const card = e.target.closest("[data-award]");
        if (card) openModal(card);
    });

    // Tutup modal
    modal.addEventListener("click", (e) => {
        if (e.target.hasAttribute("data-close-modal") || e.target.closest("[data-close-modal]")) {
            closeModal();
        }
    });

    // Tutup dengan Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) closeModal();
    });
})();