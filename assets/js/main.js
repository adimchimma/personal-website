(function () {
    const storageKey = "site-color-scheme";
    const themeOrder = ["auto", "light", "dark"];
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function getStoredTheme() {
        return localStorage.getItem(storageKey) || "auto";
    }

    function resolveTheme(theme) {
        if (theme === "auto") {
            return mediaQuery.matches ? "dark" : "light";
        }

        return theme;
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", resolveTheme(theme));
        document.documentElement.setAttribute("data-theme-preference", theme);
    }

    function updateThemeLabel(theme) {
        const label = document.querySelector("[data-theme-label]");

        if (label) {
            label.textContent = "theme: " + theme;
        }
    }

    function setTheme(theme) {
        localStorage.setItem(storageKey, theme);
        applyTheme(theme);
        updateThemeLabel(theme);
    }

    applyTheme(getStoredTheme());

    document.addEventListener("DOMContentLoaded", function () {
        const toggle = document.querySelector("[data-theme-toggle]");
        const yearTarget = document.querySelector("[data-current-year]");
        const initialTheme = getStoredTheme();

        updateThemeLabel(initialTheme);

        if (toggle) {
            toggle.addEventListener("click", function () {
                const currentTheme = getStoredTheme();
                const currentIndex = themeOrder.indexOf(currentTheme);
                const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
                setTheme(nextTheme);
            });
        }

        if (yearTarget) {
            yearTarget.textContent = String(new Date().getFullYear());
        }
    });

    mediaQuery.addEventListener("change", function () {
        if (getStoredTheme() === "auto") {
            applyTheme("auto");
            updateThemeLabel("auto");
        }
    });
}());
