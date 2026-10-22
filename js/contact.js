/* =====================================================
   CONTACT.JS
   Form Validation • Kirim ke WhatsApp
   ===================================================== */

(function () {
    "use strict";

    const form = document.getElementById("contact-form");
    if (!form) return;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const subjectInput = document.getElementById("subject");
    const messageInput = document.getElementById("message");
    const submitBtn = document.getElementById("submit-btn");
    const formStatus = document.getElementById("form-status");

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const subjectError = document.getElementById("subject-error");
    const messageError = document.getElementById("message-error");

    /* ---------------------------------------------------
       VALIDATION HELPERS
       --------------------------------------------------- */
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function showError(input, errorEl, message) {
        input.classList.add("is-invalid");
        errorEl.textContent = message;
    }

    function clearError(input, errorEl) {
        input.classList.remove("is-invalid");
        errorEl.textContent = "";
    }

    function clearAllErrors() {
        clearError(nameInput, nameError);
        clearError(emailInput, emailError);
        clearError(subjectInput, subjectError);
        clearError(messageInput, messageError);
    }

    function validateField(input, errorEl, rules) {
        const value = input.value.trim();

        if (rules.required && value === "") {
            showError(input, errorEl, rules.requiredMsg || "This field is required.");
            return false;
        }

        if (rules.minLength && value.length < rules.minLength) {
            showError(
                input,
                errorEl,
                rules.minLengthMsg || `Minimum ${rules.minLength} characters.`
            );
            return false;
        }

        if (rules.email && value !== "" && !isValidEmail(value)) {
            showError(input, errorEl, "Please enter a valid email address.");
            return false;
        }

        clearError(input, errorEl);
        return true;
    }

    /* ---------------------------------------------------
       REAL-TIME VALIDATION (on blur)
       --------------------------------------------------- */
    nameInput.addEventListener("blur", () => {
        validateField(nameInput, nameError, {
            required: true,
            requiredMsg: "Name is required.",
            minLength: 2,
            minLengthMsg: "Name must be at least 2 characters.",
        });
    });

    emailInput.addEventListener("blur", () => {
        validateField(emailInput, emailError, {
            required: true,
            requiredMsg: "Email is required.",
            email: true,
        });
    });

    subjectInput.addEventListener("blur", () => {
        validateField(subjectInput, subjectError, {
            required: true,
            requiredMsg: "Subject is required.",
            minLength: 3,
            minLengthMsg: "Subject must be at least 3 characters.",
        });
    });

    messageInput.addEventListener("blur", () => {
        validateField(messageInput, messageError, {
            required: true,
            requiredMsg: "Message is required.",
            minLength: 10,
            minLengthMsg: "Message must be at least 10 characters.",
        });
    });

    // Clear error saat user mulai mengetik lagi
    [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
        input.addEventListener("input", () => {
            if (input.classList.contains("is-invalid")) {
                const errorEl = document.getElementById(`${input.id}-error`);
                clearError(input, errorEl);
            }
        });
    });

    /* ---------------------------------------------------
       SUBMIT HANDLER
       --------------------------------------------------- */
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        clearAllErrors();
        hideStatus();

        const isNameValid = validateField(nameInput, nameError, {
            required: true,
            requiredMsg: "Name is required.",
            minLength: 2,
            minLengthMsg: "Name must be at least 2 characters.",
        });

        const isEmailValid = validateField(emailInput, emailError, {
            required: true,
            requiredMsg: "Email is required.",
            email: true,
        });

        const isSubjectValid = validateField(subjectInput, subjectError, {
            required: true,
            requiredMsg: "Subject is required.",
            minLength: 3,
            minLengthMsg: "Subject must be at least 3 characters.",
        });

        const isMessageValid = validateField(messageInput, messageError, {
            required: true,
            requiredMsg: "Message is required.",
            minLength: 10,
            minLengthMsg: "Message must be at least 10 characters.",
        });

        const isFormValid =
            isNameValid && isEmailValid && isSubjectValid && isMessageValid;

        if (!isFormValid) {
            const firstInvalid = form.querySelector(".is-invalid");
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        // Kirim ke WhatsApp
        sendToWhatsApp();
    });

    /* ---------------------------------------------------
       KIRIM KE WHATSAPP
       --------------------------------------------------- */
    function sendToWhatsApp() {
        const whatsappNumber = "6281334131755";

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const subject = subjectInput.value.trim();
        const message = messageInput.value.trim();

        const text = `Halo, saya ingin menghubungi Anda.

*Nama:* ${name}
*Email:* ${email}
*Subject:* ${subject}

*Pesan:*
${message}`;

        const encodedText = encodeURIComponent(text);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

        // Loading state
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        // 1. Tampilkan notice dulu (setelah 1 detik)
        setTimeout(() => {
            showStatus(
                "success",
                "Pesan berhasil disiapkan! Anda akan diarahkan ke WhatsApp..."
            );

            // Reset form & kembalikan tombol
            form.reset();
            clearAllErrors();
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";

            // 2. Baru buka WhatsApp setelah notice muncul (delay 2.5 detik)
            setTimeout(() => {
                window.open(whatsappURL, "_blank");

                // Sembunyikan notice setelah WhatsApp dibuka
                setTimeout(() => {
                    hideStatus();
                }, 3000);

            }, 2500); // ← delay sebelum buka WhatsApp (bisa diubah)

        }, 1000); // ← delay muncul notice
    }
    function showStatus(type, message) {
        if (!formStatus) return; // jaga-jaga kalau elemen status belum ada

        formStatus.hidden = false;
        formStatus.textContent = message;
        formStatus.className = "form-status";

        if (type === "success") {
            formStatus.classList.add("is-success");
        } else {
            formStatus.classList.add("is-error");
        }
    }

    function hideStatus() {
        if (!formStatus) return;

        formStatus.hidden = true;
        formStatus.textContent = "";
        formStatus.className = "form-status";
    }
})();