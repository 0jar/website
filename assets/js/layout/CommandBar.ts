// Command palette in Vanilla JS
// Ported from Preact implementation with improved UI

const routes = {
  home: "/", about: "/about/", projects: "/projects/", blog: "/blog/",
  now: "/now/", uses: "/uses/", contact: "/contact/", guestbook: "/guestbook/",
  colophon: "/colophon/", webring: "/webrings/", scrapbook: "/scrapbook/",
  slashes: "/slashes/", brand: "/brand/", tools: "/tools/",
};

const shortcuts = {
  home: "h", about: "a", projects: "p", blog: "b", now: "n",
  uses: "u", contact: "c", guestbook: "g", colophon: "l",
  webring: "w", scrapbook: "d", slashes: "/", brand: "k", tools: "x"
};

const ALL_ACTIONS = [
  { id: "home", label: "Home", icon: "🏠", path: routes.home, shortcut: shortcuts.home, category: "Navigation" },
  { id: "about", label: "About", icon: "👤", path: routes.about, shortcut: shortcuts.about, category: "Navigation" },
  { id: "projects", label: "Projects", icon: "💻", path: routes.projects, shortcut: shortcuts.projects, category: "Navigation" },
  { id: "blog", label: "Blog", icon: "📖", path: routes.blog, shortcut: shortcuts.blog, category: "Navigation" },
  { id: "now", label: "Now", icon: "🕒", path: routes.now, shortcut: shortcuts.now, category: "Navigation" },
  { id: "uses", label: "Uses", icon: "🔧", path: routes.uses, shortcut: shortcuts.uses, category: "Navigation" },
  { id: "contact", label: "Contact", icon: "📧", path: routes.contact, shortcut: shortcuts.contact, category: "Navigation" },
  { id: "guestbook", label: "Guestbook", icon: "💬", path: routes.guestbook, shortcut: shortcuts.guestbook, category: "Navigation" },
  { id: "colophon", label: "Colophon", icon: "📄", path: routes.colophon, shortcut: shortcuts.colophon, category: "Navigation" },
  { id: "webrings", label: "Webrings", icon: "🔄", path: routes.webring, shortcut: shortcuts.webring, category: "Navigation" },
  { id: "scrapbook", label: "Scrapbook", icon: "📅", path: routes.scrapbook, shortcut: shortcuts.scrapbook, category: "Navigation" },
  { id: "slashes", label: "Slashes", icon: "📎", path: routes.slashes, shortcut: shortcuts.slashes, category: "Navigation" },
  { id: "brand", label: "Brand", icon: "🏷️", path: routes.brand, shortcut: shortcuts.brand, category: "Navigation" },
  { id: "tools", label: "Tools", icon: "🛠️", path: routes.tools, shortcut: shortcuts.tools, category: "Navigation" },
  { id: "theme-toggle", label: "Toggle Theme", icon: "☀️", shortcut: "m", category: "Appearance", action: () => {
      const isDark = document.documentElement.classList.contains("dark");
      const newTheme = isDark ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
      document.documentElement.style.colorScheme = newTheme;
  }},
  { id: "language-toggle", label: "Change Language", icon: "🌍", shortcut: "y", category: "Appearance", action: () => {
      // In Hugo, languages usually have their own routes (/en, /et, etc.)
      // We will look for an alternate link if it exists, otherwise just redirect to root
      const altLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
      if (altLinks.length > 1) {
         let nextIndex = 0;
         for (let i=0; i<altLinks.length; i++) {
             if (altLinks[i].getAttribute("href") === window.location.href) {
                 nextIndex = (i + 1) % altLinks.length;
                 break;
             }
         }
         window.location.href = altLinks[nextIndex].getAttribute("href") || "/";
      }
  }},
  { id: "refresh-cat", label: "Refresh Mood Cat", icon: "🔄", shortcut: "r", category: "Fun", action: () => {
      document.querySelector('button[aria-label="Refresh mood cat"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }},
  { id: "tetris", label: "Play Tetris", icon: "🎮", path: "/tetris/", shortcut: "t", category: "Games" },
  { id: "2048", label: "Play 2048", icon: "🎮", path: "/2048/", shortcut: "z", category: "Games" }
];

let isOpen = false;
let selectedIndex = 0;
let filteredActions = [...ALL_ACTIONS];
let dialogEl: HTMLDivElement | null = null;
let inputEl: HTMLInputElement | null = null;
let listEl: HTMLDivElement | null = null;

function renderList() {
  if (!listEl) return;
  listEl.innerHTML = "";
  if (filteredActions.length === 0) {
    listEl.innerHTML = `<div class="px-4 py-8 text-center text-muted-foreground transition-opacity duration-200">No actions found</div>`;
    return;
  }

  // Group by category
  const grouped: Record<string, typeof ALL_ACTIONS> = {};
  filteredActions.forEach(a => {
    (grouped[a.category] = grouped[a.category] || []).push(a);
  });

  Object.entries(grouped).forEach(([category, actions]) => {
    const groupEl = document.createElement("div");
    groupEl.className = "px-2 pb-1";
    groupEl.innerHTML = `<div class="text-xs font-medium text-muted-foreground px-2 py-1.5">${category}</div>`;

    actions.forEach(a => {
      const idx = filteredActions.indexOf(a);
      const item = document.createElement("div");
      item.className = `px-2 py-1.5 flex items-center justify-between rounded-md cursor-pointer transition-colors ${idx === selectedIndex ? "bg-muted" : "hover:bg-muted/50"}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", idx === selectedIndex ? "true" : "false");
      if (idx === selectedIndex) item.id = "cmd-selected-item";
      item.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="flex-shrink-0 flex items-center justify-center w-5">${a.icon}</span>
          <span class="text-sm font-medium">${a.label}</span>
        </div>
        ${a.shortcut ? `<kbd class="px-1.5 py-0.5 text-xs bg-muted rounded border border-border font-monaspice shadow-sm">${a.shortcut}</kbd>` : ''}
      `;
      item.addEventListener("mouseenter", () => {
        selectedIndex = idx;
        renderList();
      });
      item.addEventListener("click", () => executeAction(a));
      groupEl.appendChild(item);
    });
    listEl!.appendChild(groupEl);
  });
}

function executeAction(action: any) {
  closeCommandBar();
  if (action.action) {
    action.action();
  } else if (action.path) {
    window.location.href = action.path;
  }
}

function initCommandBar() {
  if (document.getElementById("command-bar-dialog")) return;

  const container = document.createElement("div");
  container.id = "command-bar-dialog";
  // The transition classes simulate the animate-in fade-in zoom-in-95
  container.className = "fixed inset-0 z-50 flex items-start justify-center pt-[15vh] hidden transition-opacity duration-200 opacity-0";

  const searchSvg = `<svg class="absolute left-3 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`;

  container.innerHTML = `
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm command-backdrop" aria-hidden="true"></div>
    <div class="relative bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden transform scale-95 transition-transform duration-200 dialog-content" role="dialog" aria-modal="true" aria-label="Search actions...">
      <div class="p-4 pb-2">
        <div class="relative flex items-center">
          ${searchSvg}
          <input type="text" id="cmd-input" placeholder="Search actions (e.g. blog, mode, tetris)..." class="w-full pl-10 pr-4 h-10 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-shadow" aria-label="Search actions..." />
        </div>
      </div>
      <div id="cmd-list" class="max-h-[60vh] overflow-y-auto pb-2" role="listbox" aria-label="Command actions"></div>
      <div class="p-2 border-t">
        <div class="flex items-center justify-between text-xs text-muted-foreground px-2">
          <span>Press . to open</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  dialogEl = container;
  inputEl = document.getElementById("cmd-input") as HTMLInputElement;
  listEl = document.getElementById("cmd-list") as HTMLDivElement;

  container.querySelector(".command-backdrop")?.addEventListener("click", closeCommandBar);

  inputEl.addEventListener("input", (e) => {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    filteredActions = ALL_ACTIONS.filter(a => a.label.toLowerCase().includes(q) || a.id.includes(q));
    selectedIndex = 0;
    renderList();
  });
}

function openCommandBar() {
  if (!dialogEl) initCommandBar();
  isOpen = true;
  dialogEl?.classList.remove("hidden");
  // Trigger reflow to apply transition
  void dialogEl?.offsetWidth;
  dialogEl?.classList.remove("opacity-0");
  dialogEl?.querySelector(".dialog-content")?.classList.remove("scale-95");
  dialogEl?.querySelector(".dialog-content")?.classList.add("scale-100");

  inputEl!.value = "";
  filteredActions = [...ALL_ACTIONS];
  selectedIndex = 0;
  renderList();
  setTimeout(() => inputEl?.focus(), 50);
}

function closeCommandBar() {
  isOpen = false;
  dialogEl?.classList.add("opacity-0");
  dialogEl?.querySelector(".dialog-content")?.classList.remove("scale-100");
  dialogEl?.querySelector(".dialog-content")?.classList.add("scale-95");

  setTimeout(() => {
    if (!isOpen) dialogEl?.classList.add("hidden");
  }, 200);
}

document.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

  // Single-key shortcuts
  if (!isOpen && !e.metaKey && !e.ctrlKey && e.key.length === 1) {
    if (e.key === ".") {
      e.preventDefault();
      openCommandBar();
      return;
    }

    const key = e.key.toLowerCase();
    const match = ALL_ACTIONS.find(a => a.shortcut === key);
    if (match) {
      e.preventDefault();
      executeAction(match);
      return;
    }
  }

  if (!isOpen) return;

  if (e.key === "Escape") {
    e.preventDefault();
    closeCommandBar();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % filteredActions.length;
    renderList();
    const activeEl = listEl?.children[0]?.getElementsByClassName("bg-muted")[0];
    activeEl?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = (selectedIndex - 1 + filteredActions.length) % filteredActions.length;
    renderList();
    const activeEl = listEl?.children[0]?.getElementsByClassName("bg-muted")[0];
    activeEl?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter" && filteredActions.length) {
    e.preventDefault();
    executeAction(filteredActions[selectedIndex]);
  }
});
