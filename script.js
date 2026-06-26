const reveals = document.querySelectorAll(".reveal");
const year = document.getElementById("year");
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

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");

      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

reveals.forEach((node) => observer.observe(node));

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  });
}
