const reveals = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const year = document.getElementById("year");
const hoverCards = document.querySelectorAll(".info-panel, .focus-card, .timeline-item");
const themeToggle = document.getElementById("theme-toggle");
const themeLabel = document.querySelector(".theme-toggle-label");
const themeStorageKey = "preferred-theme";
const root = document.documentElement;

const applyTheme = (theme, disableTransitions = false) => {
  if (disableTransitions) {
    root.classList.add("theme-switching");
  }

  root.dataset.theme = theme;

  if (themeLabel) {
    themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
  }

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "切换为浅色模式" : "切换为深色模式"
    );
  }

  if (disableTransitions) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("theme-switching");
      });
    });
  }
};

const storedTheme = window.localStorage.getItem(themeStorageKey);
const preferredTheme =
  storedTheme ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

applyTheme(preferredTheme);

if (year) {
  year.textContent = new Date().getFullYear();
}

const animateCounter = (node) => {
  const target = Number(node.dataset.count || 0);
  const start = performance.now();
  const duration = 900;

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    node.textContent = value.toString();

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      node.textContent = target.toString();
    }
  };

  requestAnimationFrame(tick);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");

      entry.target.querySelectorAll("[data-count]").forEach((counter) => {
        if (!counter.dataset.played) {
          counter.dataset.played = "true";
          animateCounter(counter);
        }
      });

      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

reveals.forEach((node) => observer.observe(node));

counters.forEach((counter) => {
  if (!counter.closest(".reveal")) {
    animateCounter(counter);
  }
});

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  hoverCards.forEach((card) => {
    let rect = null;
    let frame = 0;
    let nextX = "50%";
    let nextY = "50%";

    const flushGlow = () => {
      frame = 0;
      card.style.setProperty("--glow-x", nextX);
      card.style.setProperty("--glow-y", nextY);
    };

    const queueGlow = (x, y) => {
      nextX = `${x}px`;
      nextY = `${y}px`;

      if (!frame) {
        frame = requestAnimationFrame(flushGlow);
      }
    };

    const updateRect = () => {
      rect = card.getBoundingClientRect();
    };

    const updateGlow = (event) => {
      if (!rect) {
        updateRect();
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      queueGlow(x, y);
    };

    const resetGlow = () => {
      rect = null;

      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }

      nextX = "50%";
      nextY = "50%";
      card.style.setProperty("--glow-x", nextX);
      card.style.setProperty("--glow-y", nextY);
    };

    card.addEventListener("mouseenter", updateRect);
    card.addEventListener("mousemove", updateGlow);
    card.addEventListener("mouseleave", resetGlow);
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  });
}
