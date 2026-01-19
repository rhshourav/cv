/*
  ============================================================
  main.js
  - Theme: system preference + localStorage + toggle button
  - Typing effect
  - Active nav highlighting
  - Anonymous message via Cloudflare Worker
  - Footer year
  ============================================================
*/

(function () {
  // ---------------------------
  // 1) THEME (Light/Dark)
  // ---------------------------
  const html = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");
  const STORAGE_KEY = "shourav_theme";

  function getSystemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);

    if (toggleBtn) {
      const isDark = theme === "dark";
      toggleBtn.setAttribute("aria-pressed", String(isDark));
      toggleBtn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || getSystemTheme();
  applyTheme(initial);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  if (!saved && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => applyTheme(getSystemTheme()));
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

      setTimeout(tick, deleting ? 40 : 70);
    }

    tick();

    setInterval(() => {
      cursorEl.style.opacity =
        cursorEl.style.opacity === "0" ? "1" : "0";
    }, 520);
  }

  // ---------------------------
  // 3) Active nav highlight
  // ---------------------------
  const sectionIds = ["experience", "education", "skills", "achievements", "contact"];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));

  function setActiveNav() {
    const y = window.scrollY + 140;
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
  // 3.5) Mobile sidebar nav (small screens)
  // ---------------------------
  const menuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("mobileSidebar");
  const overlay = document.getElementById("mobileOverlay");
  const closeBtn = document.getElementById("closeSidebar");

  function setMobileNav(open) {
    if (!sidebar || !overlay || !menuBtn) return;

    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("show", open);

    sidebar.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));

    // lock scroll while open
    document.body.style.overflow = open ? "hidden" : "";
  }

  function toggleMobileNav() {
    if (!sidebar) return;
    setMobileNav(!sidebar.classList.contains("open"));
  }

  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener("click", toggleMobileNav);
    overlay.addEventListener("click", () => setMobileNav(false));
  }
  if (closeBtn) closeBtn.addEventListener("click", () => setMobileNav(false));

  // Close when clicking a link
  if (sidebar) {
    sidebar.addEventListener("click", (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (a) setMobileNav(false);
    });
  }

  // Close on ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMobileNav(false);
  });

  // ---------------------------
  // 4) Anonymous Message -> Cloudflare Worker
  // ---------------------------
  const anonForm = document.getElementById("anonForm");
  const anonMessage = document.getElementById("anonMessage");
  const anonStatus = document.getElementById("anonStatus");
  const honeypot = document.getElementById("website");

  const MSG_ENDPOINT = "https://cryocore.rhshourav02.workers.dev/message";
  const MSG_TOKEN = "shourav"; // public; protect server-side

  function setStatus(msg) {
    if (anonStatus) anonStatus.textContent = msg;
  }

  async function postJson(url, data) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    let payload = null;
    const ct = r.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      payload = await r.json().catch(() => null);
    }

    if (!r.ok || (payload && payload.ok === false)) {
      throw new Error((payload && payload.error) || `HTTP ${r.status}`);
    }

    return payload || { ok: true };
  }

  if (anonForm && anonMessage) {
    anonForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (honeypot && honeypot.value.trim().length > 0) return;

      const msg = anonMessage.value.trim();
      if (msg.length < 5) {
        setStatus("Message too short.");
        return;
      }

      setStatus("Sending...");

      try {
        await postJson(MSG_ENDPOINT, {
          token: MSG_TOKEN,
          text: `Website Anonymous Message:\n${msg}`,
        });

        anonMessage.value = "";
        setStatus("Sent.");
      } catch (err) {
        setStatus(`Failed: ${err.message}`);
      }
    });
  }

  // ---------------------------
  // 5) Footer year
  // ---------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();