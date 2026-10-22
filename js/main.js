/* =====================================================
   MAIN.JS
   Preloader • Navbar • Smooth Scroll • Active Nav
   Back to Top • Testimonials Slider
   ===================================================== */

(function () {
    "use strict";

    /* ---------------------------------------------------
       1. PRELOADER
       --------------------------------------------------- */
    const preloader = document.getElementById("preloader");

    window.addEventListener("load", () => {
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add("is-hidden");
                setTimeout(() => preloader.remove(), 700);
            }
        }, 800);
    });

    /* ---------------------------------------------------
       2. NAVBAR
       --------------------------------------------------- */
    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".navbar__link");

    function handleNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add("is-scrolled");
        } else {
            navbar.classList.remove("is-scrolled");
        }
    }

    window.addEventListener("scroll", handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("is-open");
            navToggle.classList.toggle("is-active", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
            document.body.classList.toggle("nav-open", isOpen);
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (navMenu && navMenu.classList.contains("is-open")) {
                navMenu.classList.remove("is-open");
                navToggle.classList.remove("is-active");
                navToggle.setAttribute("aria-expanded", "false");
                document.body.classList.remove("nav-open");
            }
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navMenu && navMenu.classList.contains("is-open")) {
            navMenu.classList.remove("is-open");
            navToggle.classList.remove("is-active");
            navToggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("nav-open");
        }
    });

    /* ---------------------------------------------------
       3. SMOOTH SCROLL
       --------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#" || targetId === "") return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        });
    });

    /* ---------------------------------------------------
       4. ACTIVE NAVIGATION
       --------------------------------------------------- */
    const sections = document.querySelectorAll("section[id]");

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("id");
                    navLinks.forEach((link) => {
                        link.classList.remove("active");
                        if (link.getAttribute("href") === `#${id}`) {
                            link.classList.add("active");
                        }
                    });
                }
            });
        },
        { root: null, rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    /* ---------------------------------------------------
       5. BACK TO TOP + YEAR
       --------------------------------------------------- */
    const backToTop = document.getElementById("back-to-top");
    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    const yearEl = document.getElementById("current-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* ---------------------------------------------------
       7. TESTIMONIALS SLIDER
       --------------------------------------------------- */
    const slider = document.getElementById("testimonials-slider");

    if (slider) {
        const cards = slider.querySelectorAll(".testimonial-card");
        const dots = slider.querySelectorAll(".testimonials__dot");
        const prevBtn = slider.querySelector(".testimonials__btn--prev");
        const nextBtn = slider.querySelector(".testimonials__btn--next");

        let currentIndex = 0;
        let autoplayInterval = null;
        const AUTOPLAY_DELAY = 5000; // 5 detik

        function showSlide(index) {
            // Normalize index
            if (index >= cards.length) index = 0;
            if (index < 0) index = cards.length - 1;
            currentIndex = index;

            // Update cards
            cards.forEach((card, i) => {
                card.classList.toggle("is-active", i === currentIndex);
            });

            // Update dots
            dots.forEach((dot, i) => {
                const isActive = i === currentIndex;
                dot.classList.toggle("active", isActive);
                dot.setAttribute("aria-selected", String(isActive));
            });
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function prevSlide() {
            showSlide(currentIndex - 1);
        }

        function startAutoplay() {
            stopAutoplay();
            autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }

        // Event listeners
        if (nextBtn) nextBtn.addEventListener("click", () => {
            nextSlide();
            startAutoplay(); // reset timer
        });

        if (prevBtn) prevBtn.addEventListener("click", () => {
            prevSlide();
            startAutoplay();
        });

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                const index = parseInt(dot.getAttribute("data-index"), 10);
                showSlide(index);
                startAutoplay();
            });
        });

        // Pause on hover
        slider.addEventListener("mouseenter", stopAutoplay);
        slider.addEventListener("mouseleave", startAutoplay);

        // Pause when tab not visible
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });

        // Keyboard navigation
        slider.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") {
                prevSlide();
                startAutoplay();
            } else if (e.key === "ArrowRight") {
                nextSlide();
                startAutoplay();
            }
        });

        // Init
        showSlide(0);
        startAutoplay();
    }
})();


// kursor

// Hanya jalankan di perangkat yang mendukung pointer fine
const isFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;

if (isFinePointer) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    function animate() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;

        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';

        requestAnimationFrame(animate);
    }
    animate();

    // Hover effect
    document.querySelectorAll('a, button, .clickable, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}


