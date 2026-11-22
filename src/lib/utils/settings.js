export const activeClass = ["bg-primary", "text-primary-foreground"];
export const inactiveClass = ["text-muted-foreground", "hover:bg-muted"];
export const fontClasses = ["personal-fonts","atkinson-font","be-vietnam-pro-font","dyslexia-font","geist-font","grandstander-font", "lexend-font","outfit-font","recursive-font","space-grotesk-font","tiresias-font"];

export const setToggle = (btn, on) => {
  btn.setAttribute("aria-checked", String(on));
  const knob = btn.querySelector("span");
  if (!knob) return;
  btn.classList.toggle("bg-primary", on);
  btn.classList.toggle("bg-muted", !on);
  knob.classList.toggle("translate-x-4", on);
  knob.classList.toggle("translate-x-0.5", !on);
  knob.classList.toggle("bg-white", on);
  knob.classList.toggle("bg-muted-foreground", !on);
};

/**
 * @param {string} id
 * @param {string} key
 * @param {(on: boolean) => void} onUpdate
 */
export const bindToggle = (id, key, onUpdate) => {
  const btn = document.getElementById(id);
  if (!btn) return;
  const on =
    (localStorage.getItem(key) ?? btn.getAttribute("aria-checked")) === "true";
  setToggle(btn, on);
  onUpdate(on);
  btn.onclick = () => {
    const next = btn.getAttribute("aria-checked") !== "true";
    localStorage.setItem(key, String(next));
    setToggle(btn, next);
    onUpdate(next);
  };
};

export function bindRadioGroup(selector, key, fallback, onUpdate) {
  const buttons = Array.from(document.querySelectorAll(selector));
  function sync() {
    const current = localStorage.getItem(key) || fallback;
    for (const button of buttons) {
      const active = Object.values(button.dataset)[0] === current;
      button.tabIndex = active ? 0 : -1;
      button.setAttribute("aria-checked", String(active));
      activeClass.forEach(c => button.classList.toggle(c, active));
      inactiveClass.forEach(c => button.classList.toggle(c, !active));
    }
  }
  buttons.forEach((button, i) => {
    button.addEventListener("click", () => {
      const value = Object.values(button.dataset)[0];
      localStorage.setItem(key, value);
      onUpdate(value);
      sync();
    });
    button.addEventListener("keydown", event => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      const next = buttons[(i + step + buttons.length) % buttons.length];
      next.focus();
      next.click();
    });
  });
  sync();
  return sync;
}

export const applyFont = (font) => {
  document.documentElement.classList.remove(...fontClasses);
  const className = font === "personal" ? "personal-fonts" : font === "system" ? "" : `${font}-font`;
  if (className) document.documentElement.classList.add(className);
};
