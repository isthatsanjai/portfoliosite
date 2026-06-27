// ==========================================
// 0. Mobile Nav Toggle
// ==========================================
const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');

if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
    });

    // Close menu when a link is tapped
    mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
        });
    });
}

// ==========================================
// 1. Smooth Scrolling for Navigation Links
// ==========================================
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==========================================
// 2. Back to Top Button
// ==========================================
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==========================================
// 3. Contact Form Submission (Formspree)
// ==========================================
const form = document.getElementById('contactForm');
const formMessage = document.getElementById('form-message');

if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        const action = form.action;

        fetch(action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                formMessage.textContent = "Thank you! Your message has been sent successfully.";
                formMessage.style.color = "#2a9d8f";
                form.reset();
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        formMessage.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        formMessage.textContent = "Oops! There was a problem submitting your form. Please try again.";
                    }
                    formMessage.style.color = "var(--text-secondary)";
                }).catch(() => {
                    formMessage.textContent = "Oops! There was a problem submitting your form. Please try again.";
                    formMessage.style.color = "var(--text-secondary)";
                });
            }
        }).catch(error => {
            console.error('Fetch Error:', error);
            formMessage.textContent = "Oops! There was a network error. Please check your connection and try again.";
            formMessage.style.color = "var(--text-secondary)";
        }).finally(() => {
            setTimeout(() => { formMessage.textContent = ''; }, 6000);
        });
    });
}

// ==========================================
// 4. GSAP Animations & Layout (Timeline & Projects)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // --- A. Timeline SVG Animation ---
        const timelineSvg = document.querySelector('.timeline-svg');
        if (timelineSvg) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.timeline-svg',
                    start: 'top 75%',
                    end: 'bottom 75%',
                    scrub: 0.8,
                }
            });

            // Draw the path
            tl.to('.timeline-path', {
                strokeDashoffset: 0,
                ease: 'none',
                duration: 5
            }, 0);

            // Dot pulses
            const dotEase = 'elastic.out(10, 1)';
            tl.to('#ball-1', { visibility: 'visible', scale: 1.15, transformOrigin: 'center', ease: dotEase, duration: 0.3 }, 0.6);
            tl.to('#ball-2', { visibility: 'visible', scale: 1.15, transformOrigin: 'center', ease: dotEase, duration: 0.3 }, 1.8);
            tl.to('#ball-3', { visibility: 'visible', scale: 1.15, transformOrigin: 'center', ease: dotEase, duration: 0.3 }, 2.65);
            tl.to('#ball-4', { visibility: 'visible', scale: 1.15, transformOrigin: 'center', ease: dotEase, duration: 0.3 }, 4.7);

            // Connector lines
            tl.to('#line-1', { opacity: 1, duration: 0.2 }, 0.65);
            tl.to('#line-2', { opacity: 1, duration: 0.2 }, 1.85);
            tl.to('#line-3', { opacity: 1, duration: 0.2 }, 2.70);
            tl.to('#line-4', { opacity: 1, duration: 0.2 }, 4.75);

            // Text fades in
            tl.to('#entry-1', { opacity: 1, duration: 0.4 }, 0.7);
            tl.to('#entry-2', { opacity: 1, duration: 0.4 }, 1.9);
            tl.to('#entry-3', { opacity: 1, duration: 0.4 }, 2.75);
            tl.to('#entry-4', { opacity: 1, duration: 0.4 }, 4.8);
        }

        // --- B. Masonry Projects Layout ---
        const container = document.querySelector('.projects-container');
        const cards = document.querySelectorAll('.project-card');

        if (container && cards.length > 0) {
            let hasRevealed = false; // Tracks if the scroll animation has fired

            function getColumns() {
                if (window.matchMedia('(min-width: 1500px)').matches) return 4;
                if (window.matchMedia('(min-width: 1000px)').matches) return 3;
                if (window.matchMedia('(min-width: 600px)').matches) return 2;
                return 1;
            }

            function layoutGrid() {
                const cols = getColumns();
                const colHeights = Array(cols).fill(0);
                const gap = 24;

                const containerWidth = container.getBoundingClientRect().width;
                const cardWidth = (containerWidth - (gap * (cols - 1))) / cols;

                cards.forEach((card) => {
                    card.style.width = `${cardWidth}px`;

                    const minHeightIndex = colHeights.indexOf(Math.min(...colHeights));
                    const x = minHeightIndex * (cardWidth + gap);
                    const y = colHeights[minHeightIndex];

                    if (!hasRevealed) {
                        // 1. Initial Load: Hide them and push them down 60px
                        gsap.set(card, { x: x, y: y + 60, opacity: 0 });
                        // Store their real target height for later
                        card.dataset.targetY = y;
                    } else {
                        // 2. Window Resize: Animate smoothly to new grid spots
                        gsap.to(card, { x: x, y: y, duration: 0.4, ease: "power2.out" });
                    }

                    colHeights[minHeightIndex] += card.offsetHeight + gap;
                });

                container.style.height = `${Math.max(...colHeights)}px`;
            }

            // Run initial setup
            layoutGrid();

            // 3. The Scroll Animation Trigger
            ScrollTrigger.create({
                trigger: '.work-section',
                start: 'top 65%',
                onEnter: () => {
                    hasRevealed = true; // Mark as revealed so resize behaves normally

                    cards.forEach((card, index) => {
                        gsap.to(card, {
                            opacity: 1,
                            y: card.dataset.targetY, // Float up to the stored correct height
                            duration: 0.8,
                            delay: index * 0.1, // Creates the staggered 1-by-1 effect
                            ease: "power3.out"
                        });
                    });
                },
                once: true // Ensures the entrance animation only happens once
            });

            // Re-calculate cleanly on resize
            window.addEventListener('resize', () => {
                clearTimeout(window.resizeTimer);
                window.resizeTimer = setTimeout(() => {
                    layoutGrid();
                    ScrollTrigger.refresh();
                }, 100);
            });
        }
    } else {
        console.error("GSAP or ScrollTrigger not loaded!");
    }
});