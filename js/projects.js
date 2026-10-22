/* =====================================================
   PROJECTS.JS
   Project Filter • Project Modal
   ===================================================== */

(function () {
    "use strict";

    /* ---------------------------------------------------
       DATA PROJECT (bisa diganti / ditambah)
       --------------------------------------------------- */
    const projectsData = {
        1: {
            title: "Autentikasi API",
            description: "Materi lengkap tentang Autentikasi API.",
            image: "assets/icons/autentikasi/a.5.png",
            tech: ["PowerPoint", "API", "Auth"],
            live: "assets/material/Autentikasi/Autentikasi_API.pptx",
            source: "#",
            category: "Autentikasi • API",
        },
        2: {
            title: "CRUD Toko Laravel",
            description: "Implementasi CRUD toko menggunakan Laravel.",
            image: "assets/icons/autentikasi/a4.png",
            tech: ["Laravel", "CRUD", "PowerPoint"],
            live: "assets/material/Autentikasi/crud-toko-laravel.pptx",
            source: "#",
            category: "Autentikasi • Laravel",
        },
        3: {
            title: "API Auth & CRUD Posts",
            description: "Dokumentasi lengkap API Authentication + CRUD Posts.",
            image: "assets/icons/autentikasi/a.3.png",
            tech: ["API", "Auth", "CRUD"],
            live: "assets/material/Autentikasi/API_Auth _CRUD_Posts.pptx",
            source: "#",
            category: "Autentikasi • API",
        },
        4: {
            title: "JWT Autentikasi API",
            description: "Materi JSON Web Token (JWT) untuk autentikasi API.",
            image: "assets/icons/autentikasi/a.2.png",
            tech: ["JWT", "API", "Auth"],
            live: "assets/material/Autentikasi/JWT_Autentikasi_API.pptx",
            source: "#",
            category: "Autentikasi • JWT",
        },
        5: {
            title: "Laravel API CRUD Sanctum",
            description: "Tutorial Laravel API CRUD menggunakan Laravel Sanctum.",
            image: "assets/icons/autentikasi/a.1.png",
            tech: ["Laravel", "Sanctum", "API"],
            live: "assets/material/Autentikasi/Laravel_API_CRUD_Sanctum_Tutorial.pptx",
            source: "#",
            category: "Autentikasi • Laravel",
        },
        6: {
            title: "OAuth2 Autentikasi API",
            description: "Materi OAuth 2.0 untuk autentikasi API.",
            image: "assets/icons/autentikasi/a.6.png",
            tech: ["OAuth2", "API", "Auth"],
            live: "assets/material/Autentikasi/OAuth2_Autentikasi_API.pptx",
            source: "#",
            category: "Autentikasi • OAuth2",
        },
        7: {
            title: "CRUD Laravel",
            description: "Materi dasar CRUD menggunakan Laravel.",
            image: "assets/icons/database/d1.png",
            tech: ["Laravel", "CRUD", "Database"],
            live: "assets/material/database/CRUD_Laravel.pptx",
            source: "#",
            category: "Database • Laravel",
        },
        8: {
            title: "Langkah-langkah CRUD Laravel",
            description: "Panduan step-by-step membuat CRUD di Laravel.",
            image: "assets/icons/database/d2.png",
            tech: ["Laravel", "CRUD", "Tutorial"],
            live: "assets/material/database/Langkah_Langkah_CRUD_Laravel.pptx",
            source: "#",
            category: "Database • Laravel",
        },
        9: {
            title: "Normalization Database",
            description: "Materi normalisasi database (1NF, 2NF, 3NF, dll).",
            image: "assets/icons/database/d3.png",
            tech: ["Database", "Normalization", "SQL"],
            live: "assets/material/database/Normalization_Database.pptx",
            source: "#",
            category: "Database • Normalization",
        },
        10: {
            title: "Query SQL",
            description: "Materi dasar sampai lanjutan Query SQL.",
            image: "assets/icons/database/d4.png",
            tech: ["SQL", "Database", "Query"],
            live: "assets/material/database/Query_SQL.pptx",
            source: "#",
            category: "Database • SQL",
        },
        11: {
            title: "Roadmap Backend",
            description: "Roadmap lengkap belajar Backend Development.",
            image: "assets/icons/fundamental/f1.png",
            tech: ["Backend", "Roadmap", "PowerPoint"],
            live: "assets/material/fundamental/Roadmap_Backend.pptx",
            source: "#",
            category: "Fundamental • Backend",
        },
        12: {
            title: "OOP Backend Architecture Notes",
            description: "Catatan arsitektur backend berbasis Object-Oriented Programming.",
            image: "assets/icons/oop/o1.png",
            tech: ["OOP", "Backend", "Markdown"],
            live: "assets/material/OOP/oop-backend-architecture-notes.md",
            source: "#",
            category: "OOP • Backend",
        },
        13: {
            title: "Python Sesi 1 – UPT TIKP JATIM",
            description: "Materi Python sesi 1 dari UPT TIKP Jawa Timur.",
            image: "assets/icons/pythone/p1.png",
            tech: ["Python", "PDF", "Dasar"],
            live: "assets/material/phyton/Python Sesi 1 UPT TIKP JATIM.pdf",
            source: "#",
            category: "Python • Dasar",
        },
        14: {
            title: "Python Sesi 2 – UPT TIKP JATIM",
            description: "Materi Python sesi 2 dari UPT TIKP Jawa Timur.",
            image: "assets/icons/pythone/p2.png",
            tech: ["Python", "PDF"],
            live: "assets/material/phyton/Python Sesi 2 UPT TIKP JATIM.pdf",
            source: "#",
            category: "Python",
        },
        15: {
            title: "Python Sesi 3 – UPT TIKP JATIM",
            description: "Materi Python sesi 3 dari UPT TIKP Jawa Timur.",
            image: "assets/icons/pythone/p3.png",
            tech: ["Python", "PDF"],
            live: "assets/material/phyton/Python Sesi 3 UPT TIKP JATIM.pdf",
            source: "#",
            category: "Python",
        },
        16: {
            title: "HTTP Penjelasan",
            description: "Penjelasan lengkap tentang protokol HTTP.",
            image: "assets/icons/rest/r1.png",
            tech: ["HTTP", "REST", "API"],
            live: "assets/material/REST/HTTP_Penjelasan.pptx",
            source: "#",
            category: "REST • HTTP",
        },
        17: {
            title: "JSON REST API",
            description: "Materi tentang format JSON dalam REST API.",
            image: "assets/icons/rest/r2.png",
            tech: ["JSON", "REST", "API"],
            live: "assets/material/REST/JSON_REST_API.pptx",
            source: "#",
            category: "REST • JSON",
        },
        18: {
            title: "Request & Response",
            description: "Penjelasan Request dan Response dalam REST API.",
            image: "assets/icons/rest/r3.png",
            tech: ["REST", "HTTP", "API"],
            live: "assets/material/REST/Request_Response.pptx",
            source: "#",
            category: "REST",
        },
        19: {
            title: "REST API Endpoint",
            description: "Materi tentang Endpoint di REST API.",
            image: "assets/icons/rest/r4.png",
            tech: ["REST", "Endpoint", "API"],
            live: "assets/material/REST/REST_API_Endpoint.pptx",
            source: "#",
            category: "REST • Endpoint",
        },
        20: {
            title: "Status Code REST API",
            description: "Penjelasan HTTP Status Code yang umum digunakan di REST API.",
            image: "assets/icons/rest/r5.png",
            tech: ["Status Code", "HTTP", "REST"],
            live: "assets/material/REST/Status_Code_REST_API.pptx",
            source: "#",
            category: "REST • Status Code",
        },
    };

    /* ---------------------------------------------------
       1. PROJECT FILTER
       --------------------------------------------------- */
    const filterButtons = document.querySelectorAll(".projects__filter");
    const projectCards = document.querySelectorAll(".project-card");

    if (filterButtons.length && projectCards.length) {
        filterButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const filter = btn.getAttribute("data-filter");

                // Active state
                filterButtons.forEach((b) => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");

                // Filter cards
                projectCards.forEach((card) => {
                    const categories = card.getAttribute("data-category") || "";

                    if (filter === "all" || categories.includes(filter)) {
                        card.classList.remove("is-hidden");
                        card.style.display = "";
                        // Trigger reflow + animation
                        requestAnimationFrame(() => {
                            card.classList.add("is-visible");
                        });
                    } else {
                        card.classList.remove("is-visible");
                        card.classList.add("is-hidden");
                        // Setelah animasi selesai, sembunyikan
                        setTimeout(() => {
                            if (card.classList.contains("is-hidden")) {
                                card.style.display = "none";
                            }
                        }, 350);
                    }
                });
            });
        });
    }

    /* ---------------------------------------------------
       2. PROJECT MODAL
       --------------------------------------------------- */
    const modal = document.getElementById("project-modal");
    const modalBody = document.getElementById("modal-body");
    const closeButtons = document.querySelectorAll("[data-close-modal]");

    function openModal(projectId) {
        const data = projectsData[projectId];
        if (!data || !modal || !modalBody) return;

        modalBody.innerHTML = `
      <div class="modal__image">
        <img src="${data.image}" alt="${data.title}" loading="lazy">
      </div>
      <div class="modal__info">
        <span class="modal__category">${data.category}</span>
        <h3 id="modal-title" class="modal__title">${data.title}</h3>
        <p class="modal__description">${data.description}</p>
        <ul class="modal__tech">
          ${data.tech.map((t) => `<li>${t}</li>`).join("")}
        </ul>
        <div class="modal__actions">
          <a href="${data.live}" class="btn btn--primary" target="_blank" rel="noopener noreferrer">
            Download
          </a>
          <a href="${data.source}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">
            Clouse
          </a>
        </div>
      </div>
    `;

        modal.hidden = false;
        document.body.style.overflow = "hidden";

        // Focus trap sederhana
        const closeBtn = modal.querySelector(".modal__close");
        if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.hidden = true;
        document.body.style.overflow = "";
    }

    // Buka modal dari tombol "View Details"
    document.querySelectorAll(".project-card__view").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute("data-project");
            openModal(id);
        });
    });

    // Buka modal juga saat klik card (opsional, lebih nyaman)
    projectCards.forEach((card) => {
        card.addEventListener("click", (e) => {
            // Jangan buka jika klik link Live Demo / Source
            if (e.target.closest(".project-card__link")) return;
            if (e.target.closest(".project-card__view")) return;

            const id = card.getAttribute("data-id");
            if (id) openModal(id);
        });
    });

    // Tutup modal
    closeButtons.forEach((btn) => {
        btn.addEventListener("click", closeModal);
    });

    // Tutup dengan Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && !modal.hidden) {
            closeModal();
        }
    });

    // Tutup saat klik backdrop
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal || e.target.hasAttribute("data-close-modal")) {
                closeModal();
            }
        });
    }
})();