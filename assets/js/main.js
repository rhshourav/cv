/*
  ============================================================
  main.js
  - Theme: system preference + localStorage + toggle button
  - Typing effect
  - Active nav highlighting
  - Footer year
  ============================================================
*/

(function () {
  // ---------------------------
  // 1) THEME (Light/Dark)
  // ---------------------------
  const html = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");
  const icon = toggleBtn ? toggleBtn.querySelector(".theme-icon") : null;

  const STORAGE_KEY = "shourav_theme";

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);

    // Update toggle UI (me: keep it obvious)
    if (toggleBtn && icon) {
      const isDark = theme === "dark";
      toggleBtn.setAttribute("aria-pressed", String(isDark));
      icon.textContent = isDark ? "☀" : "☾";
      toggleBtn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    }
  }

  // Initial theme load:
  // - Use saved theme if exists
  // - Otherwise use system preference
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || getSystemTheme();
  applyTheme(initial);

  // Toggle handler
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  // Optional: if user never set a preference, follow system changes dynamically
  // (me: only do this when no saved preference exists)
  if (!saved && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    });
  }

  // ---------------------------
  // 2) Typing effect (Hero)
  // ---------------------------
  const typingEl = document.getElementById("typingText");
  const cursorEl = document.getElementById("cursor");

  if (typingEl && cursorEl) {
    const roles = [
      "IT Officer",
      "DevOps (Foundations)",
      "Cybersecurity Practitioner",
      "Infrastructure Monitoring",
      "System Hardening"
    ];

    let r = 0, i = 0, deleting = false;

    function tick() {
      const word = roles[r];

      if (!deleting) {
        typingEl.textContent = word.slice(0, i++);
        if (i > word.length + 10) deleting = true;
      } else {
        typingEl.textContent = word.slice(0, i--);
        if (i <= 0) {
          deleting = false;
          r = (r + 1) % roles.length;
        }
      }

      const speed = deleting ? 40 : 70;
      setTimeout(tick, speed);
    }
    tick();

    // Cursor blink
    setInterval(() => {
      cursorEl.style.opacity = (cursorEl.style.opacity === "0" ? "1" : "0");
    }, 520);
  }

  // ---------------------------
  // 3) Active nav highlight
  // ---------------------------
  const sectionIds = ["experience", "education", "skills", "achievements", "contact"];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));

  function setActiveNav() {
    const y = window.scrollY + 140; // offset for sticky nav
    let current = sectionIds[0];

    for (const s of sections) {
      if (s.offsetTop <= y) current = s.id;
    }

    navLinks.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }

  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  // ---------------------------
  // 4) Footer year
  // ---------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
