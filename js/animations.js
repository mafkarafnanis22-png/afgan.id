/* =====================================================
   ANIMATIONS.JS
   Typing • Particles • Mouse Glow • Counter • Scroll Reveal
   ===================================================== */

(function () {
    "use strict";

    /* ---------------------------------------------------
       1. TYPING EFFECT
       --------------------------------------------------- */
    const typingEl = document.getElementById("typing-text");

    if (typingEl) {
        const words = [
            "Web Developer",
            "Design Graphic",
            "Frontend Enthusiast",
            "UI Implementer",
        ];

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function type() {
            const currentWord = words[wordIndex];

            if (isDeleting) {
                typingEl.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 45;
            } else {
                typingEl.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                typingSpeed = 1800;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typingSpeed = 400;
            }

            setTimeout(type, typingSpeed);
        }

        setTimeout(type, 1200);
    }

    /* ---------------------------------------------------
       2. SUBTLE PARTICLES (Canvas)
       --------------------------------------------------- */
    const particlesContainer = document.getElementById("particles");

    if (particlesContainer && window.innerWidth > 768) {
        const canvas = document.createElement("canvas");
        canvas.className = "hero__particles-canvas";
        particlesContainer.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        let particles = [];
        let animationId;
        let width, height;

        function resize() {
            width = canvas.width = particlesContainer.offsetWidth;
            height = canvas.height = particlesContainer.offsetHeight;
        }

        function createParticles() {
            particles = [];
            const count = Math.min(40, Math.floor((width * height) / 18000));

            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.8 + 0.4,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    opacity: Math.random() * 0.4 + 0.1,
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(124, 108, 255, ${p.opacity})`;
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(124, 108, 255, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(draw);
        }

        resize();
        createParticles();
        draw();

        window.addEventListener("resize", () => {
            resize();
            createParticles();
        }, { passive: true });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                draw();
            }
        });

        /* ---------------------------------------------------
           3D TILT CARD
           --------------------------------------------------- */
        (function () {
            "use strict";

            const wrap = document.getElementById("tilt-wrap");
            const card = document.getElementById("tilt-card");
            if (!wrap || !card) return;

            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const finePointer = window.matchMedia("(pointer: fine)").matches;
            if (reduce || !finePointer) return;

            const MAX = 12; // derajat kemiringan maksimum

            wrap.addEventListener("pointermove", (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;

                card.style.setProperty("--ry", `${(px - 0.5) * 2 * MAX}deg`);
                card.style.setProperty("--rx", `${(0.5 - py) * 2 * MAX}deg`);
                card.style.setProperty("--gx", `${px * 100}%`);
                card.style.setProperty("--gy", `${py * 100}%`);
            });

            wrap.addEventListener("pointerleave", () => {
                card.style.setProperty("--rx", "0deg");
                card.style.setProperty("--ry", "0deg");
            });
        })();

    }

    /* ---------------------------------------------------
       3. MOUSE-FOLLOW GLOW
       --------------------------------------------------- */
    const hero = document.querySelector(".hero");

    if (hero && window.matchMedia("(pointer: fine)").matches) {
        const glow = document.createElement("div");
        glow.className = "hero__mouse-glow";
        hero.appendChild(glow);

        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        hero.addEventListener("mousemove", (e) => {
            const rect = hero.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        }, { passive: true });

        hero.addEventListener("mouseleave", () => {
            glow.style.opacity = "0";
        });

        hero.addEventListener("mouseenter", () => {
            glow.style.opacity = "1";
        });

        function animateGlow() {
            currentX += (mouseX - currentX) * 0.08;
            currentY += (mouseY - currentY) * 0.08;
            glow.style.transform = `translate(${currentX}px, ${currentY}px)`;
            requestAnimationFrame(animateGlow);
        }

        animateGlow();
    }

    /* ---------------------------------------------------
       4. FLOATING ORBS
       --------------------------------------------------- */
    const orbs = document.querySelectorAll(".hero__orb");
    orbs.forEach((orb, i) => {
        orb.style.animationDelay = `${i * 1.5}s`;
    });

    /* ---------------------------------------------------
       5. ANIMATED COUNTER
       --------------------------------------------------- */
    function animateCounter(element, target, duration = 1800) {
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(start + (target - start) * ease);

            element.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    const counterElements = document.querySelectorAll(
        ".about__stat-number[data-target], .stat-item__number[data-target]"
    );

    if (counterElements.length > 0) {
        const counterObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const target = parseInt(el.getAttribute("data-target"), 10);

                        if (!isNaN(target) && !el.classList.contains("is-counted")) {
                            el.classList.add("is-counted");
                            animateCounter(el, target);
                        }
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.5, rootMargin: "0px 0px -10% 0px" }
        );

        counterElements.forEach((el) => counterObserver.observe(el));
    }

    /* ---------------------------------------------------
       6. SCROLL REVEAL (Experience + general)
       --------------------------------------------------- */
    const revealElements = document.querySelectorAll(
        ".section__header, .award_section, .about__grid, .award, .notes, .services__grid, .statistics__grid, .testimonials__slider, .contact__grid"
    );

    if (revealElements.length > 0) {
        // Set initial state
        revealElements.forEach((el) => {
            el.classList.add("reveal");
        });

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-revealed");
                        observer.unobserve(entry.target); // hanya sekali
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: "0px 0px -40px 0px",
            }
        );

        revealElements.forEach((el) => revealObserver.observe(el));
    }

})();