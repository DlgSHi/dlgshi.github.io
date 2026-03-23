// Theme initialization is handled inside DOMContentLoaded to avoid
// interacting with DOM nodes before they're available.

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

// Theme + years init
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved/preferred theme on load
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
    } else if (!savedTheme) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) root.setAttribute('data-theme', 'dark');
    }

    // Calculate and update years of experience displayed on the page
    try {
        const startMonth = 8; // August
        const startYear = 2015;
        const now = new Date();
        const months = (now.getFullYear() - startYear) * 12 + (now.getMonth() - (startMonth - 1));
        const years = Math.floor(months / 12);
        const display = `${years}+`;
        const el = document.getElementById('years-ex');
        const el2 = document.getElementById('years-ex-highlights');
        if (el) el.textContent = display;
        if (el2) el2.textContent = display;
    } catch (e) { console.error('years calc', e); }
});

// ── Dock Magnification Effect ──
(function initDock() {
    const MAGNIFICATION = 80;
    const DISTANCE = 150;
    const BASE_SIZE = 40;

    document.addEventListener('DOMContentLoaded', () => {
        const dock = document.getElementById('dock');
        if (!dock) return;

        const items = dock.querySelectorAll('.dock-item');

        dock.addEventListener('mousemove', (e) => {
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.x + rect.width / 2;
                const dist = Math.abs(e.clientX - itemCenterX);

                const scale = Math.max(
                    BASE_SIZE,
                    MAGNIFICATION - (MAGNIFICATION - BASE_SIZE) * (dist / DISTANCE)
                );
                const size = Math.min(scale, MAGNIFICATION);

                item.style.width = size + 'px';
                item.style.height = size + 'px';
            });
        });

        dock.addEventListener('mouseleave', () => {
            items.forEach(item => {
                item.style.width = BASE_SIZE + 'px';
                item.style.height = BASE_SIZE + 'px';
            });
        });

        // Dock theme toggle
        const dockThemeToggle = dock.querySelector('.dock-theme-toggle');
        if (dockThemeToggle) {
            dockThemeToggle.addEventListener('click', () => {
                const root = document.documentElement;
                const isDark = root.getAttribute('data-theme') === 'dark';
                const newTheme = isDark ? '' : 'dark';

                if (newTheme === 'dark') {
                    root.setAttribute('data-theme', 'dark');
                } else {
                    root.removeAttribute('data-theme');
                }
                localStorage.setItem('theme', newTheme);
                updateDockThemeIcon();
                // Also update the hero toggle if present
                const toggleEl = document.querySelector('.toggle');
                if (toggleEl) {
                    toggleEl.setAttribute('aria-checked', newTheme === 'dark' ? 'true' : 'false');
                }
            });

            dockThemeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dockThemeToggle.click();
                }
            });
        }

        function updateDockThemeIcon() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const sun = dock.querySelector('.dock-sun');
            const moon = dock.querySelector('.dock-moon');
            if (sun && moon) {
                sun.style.display = isDark ? 'none' : '';
                moon.style.display = isDark ? '' : 'none';
            }
        }

        // Initial state
        updateDockThemeIcon();

        // Observe theme changes from other toggles
        const mo = new MutationObserver(() => updateDockThemeIcon());
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // Smooth scroll for dock links
        dock.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    });
})();

// ── Glowing Effect ──
(function initGlowingEffect() {
    const SPREAD = 40;
    const PROXIMITY = 64;
    const INACTIVE_ZONE = 0.01;

    // Selectors for cards that should glow (inner cards only, not bento containers)
    const CARD_SELECTORS = '.skill-group, .project-card, .exp-card';

    function setupGlow() {
        document.querySelectorAll(CARD_SELECTORS).forEach(card => {
            if (card.querySelector('.glow-border')) return; // already set up
            card.classList.add('glow-wrapper');
            card.style.setProperty('--glow-spread', SPREAD);

            const border = document.createElement('div');
            border.className = 'glow-border';
            card.appendChild(border);

            const borderBlur = document.createElement('div');
            borderBlur.className = 'glow-border-blur';
            card.appendChild(borderBlur);
        });
    }

    function handlePointerMove(e) {
        document.querySelectorAll('.glow-wrapper').forEach(el => {
            const { left, top, width, height } = el.getBoundingClientRect();
            const centerX = left + width * 0.5;
            const centerY = top + height * 0.5;
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const distFromCenter = Math.hypot(mouseX - centerX, mouseY - centerY);
            const inactiveRadius = 0.5 * Math.min(width, height) * INACTIVE_ZONE;

            if (distFromCenter < inactiveRadius) {
                el.style.setProperty('--glow-active', '0');
                return;
            }

            const isActive =
                mouseX > left - PROXIMITY &&
                mouseX < left + width + PROXIMITY &&
                mouseY > top - PROXIMITY &&
                mouseY < top + height + PROXIMITY;

            el.style.setProperty('--glow-active', isActive ? '1' : '0');

            if (!isActive) return;

            const angle = (180 * Math.atan2(mouseY - centerY, mouseX - centerX)) / Math.PI + 90;
            el.style.setProperty('--glow-start', angle);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupGlow();
        document.body.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('scroll', () => {
            // Re-evaluate on scroll since card positions change
            document.querySelectorAll('.glow-wrapper').forEach(el => {
                el.style.setProperty('--glow-active', '0');
            });
        }, { passive: true });
    });
})();

// Scroll animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    observer.observe(el);
});
