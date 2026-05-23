export const activeClass = ["bg-primary", "text-primary-foreground"];
export const inactiveClass = ["text-muted-foreground", "hover:bg-muted"];
export const fontClasses = ["personal-fonts","atkinson-font","be-vietnam-pro-font","basier-font","dyslexia-font","geist-font","grandstander-font", "lexend-font","outfit-font","recursive-font","space-grotesk-font","tiresias-font"];

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

export const updateRadioGroup = (selector, storageKey, fallback) => {
  const current = localStorage.getItem(storageKey) || fallback;
  document.querySelectorAll(selector).forEach((btn) => {
    const active = Object.values(btn.dataset)[0] === current;
    btn.setAttribute("aria-checked", String(active));
    activeClass.forEach((c) => btn.classList.toggle(c, active));
    inactiveClass.forEach((c) => btn.classList.toggle(c, !active));
  });
};

export const bindRadioGroup = (selector, storageKey, fallback, signal, onUpdate) => {
  updateRadioGroup(selector, storageKey, fallback);
  document.querySelectorAll(selector).forEach((btn) => {
    btn.addEventListener("click", () => {
        const value = Object.values(btn.dataset)[0];
        if (value) {
          localStorage.setItem(storageKey, value);
          updateRadioGroup(selector, storageKey, fallback);
          onUpdate?.(value);
        }
      }, { signal },
    );
  });
};

export const applyFont = (font) => {
  document.documentElement.classList.remove(...fontClasses);
  const className = font === "personal" ? "personal-fonts" : font === "system" ? "" : `${font}-font`;
  if (className) document.documentElement.classList.add(className);
};
