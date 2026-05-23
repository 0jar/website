// Shared theme cycling utility
import { themes } from "@/lib/constants";

export function applyTheme(theme) {
  localStorage.setItem("theme", theme);
  document.documentElement.classList.remove("light", "dark");
  const resolved = theme === "light" ? "light"
    : theme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : "dark";
  document.documentElement.classList.add(resolved);
  document.documentElement.style.colorScheme = resolved;
}

export function cycleTheme() {
  const current = localStorage.getItem("theme") || "dark";
  const idx = themes.indexOf(current);
  applyTheme(themes[(idx + 1) % themes.length]);
}
