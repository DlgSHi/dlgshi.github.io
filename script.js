// Theme initialization is handled inside DOMContentLoaded to avoid
// interacting with DOM nodes before they're available.

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

// Mobile / hamburger nav (now hamburger-only)
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const toggleEl = document.querySelector('.toggle');
    let previousActive = null;
    let focusableElements = [];
    let trapListener = null;
    if (!hamburger || !navLinks) return;

    // Defensive: remove any accidental empty direct child nodes inside the nav
    // (fixes stray empty-pill artifacts that may be injected or left behind).
    try {
        const nav = document.querySelector('.nav');
        if (nav) {
            Array.from(nav.children).forEach(ch => {
                const isEmpty = (ch.textContent || '').trim() === '' && ch.children.length === 0;
                if (isEmpty) ch.remove();
            });
        }
    } catch (e) { /* no-op */ }

    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');

    function createBackdrop() {
        let backdrop = document.querySelector('.nav-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'nav-backdrop';
            document.body.appendChild(backdrop);
            backdrop.addEventListener('click', closeNav);
        }
        return backdrop;
    }

    function openNav() {
        const backdrop = createBackdrop();
        requestAnimationFrame(() => backdrop.classList.add('visible'));
        navLinks.classList.add('active');
        navLinks.setAttribute('aria-hidden', 'false');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        // Save previously focused element to restore on close
        previousActive = document.activeElement;
        // Collect focusable elements inside the nav
        focusableElements = Array.from(navLinks.querySelectorAll('a[href], button, [role="button"], [tabindex]:not([tabindex="-1"])'))
            .filter(el => !el.hasAttribute('disabled'));
        // Focus first focusable element
        if (focusableElements.length) focusableElements[0].focus();
        // Add keydown trap to keep focus inside the drawer
        trapListener = function (e) {
            if (e.key !== 'Tab') return;
            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];
            if (!first || !last) return;
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', trapListener);
    }

    function closeNav() {
        const backdrop = document.querySelector('.nav-backdrop');
        if (backdrop) backdrop.classList.remove('visible');
        navLinks.classList.remove('active');
        navLinks.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        // Remove keydown trap
        if (trapListener) {
            document.removeEventListener('keydown', trapListener);
            trapListener = null;
        }
        // Restore focus to the previously active element (usually the hamburger)
        if (previousActive && typeof previousActive.focus === 'function') previousActive.focus();
        setTimeout(() => {
            const b = document.querySelector('.nav-backdrop');
            if (b) b.remove();
        }, 260);
    }

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navLinks.classList.contains('active')) closeNav(); else openNav();
    });

    // Close nav when clicking a link
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeNav()));

    // Close on Escape
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

    // Theme toggle initialization (safe guard)
    if (toggleEl) {
        const root = document.documentElement;
        function setTheme(mode) {
            const sun = document.querySelector('.theme-toggle .sun');
            const moon = document.querySelector('.theme-toggle .moon');
            if (mode === 'dark') {
                root.setAttribute('data-theme', 'dark');
            } else {
                root.removeAttribute('data-theme');
            }
            // persist as either 'dark' or empty string for light/default
            localStorage.setItem('theme', mode === 'dark' ? 'dark' : '');
            toggleEl.setAttribute('aria-checked', mode === 'dark' ? 'true' : 'false');
            if (sun) sun.setAttribute('aria-hidden', mode === 'dark' ? 'true' : 'false');
            if (moon) moon.setAttribute('aria-hidden', mode === 'dark' ? 'false' : 'true');
        }

        toggleEl.addEventListener('click', () => {
            const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : '';
            setTheme(current === 'dark' ? '' : 'dark');
        });
        // keyboard support
        toggleEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEl.click(); } });

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setTheme('dark');
        } else {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : '');
        }
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
