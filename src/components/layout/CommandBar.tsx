// Command palette
// Ported from Next.js v4

import { useState, useEffect, useRef, useMemo, useCallback } from "preact/hooks";
import type { JSX } from "preact";
import { cycleLanguage, t as i18nT, getPageLocale } from "@/i18n/client";
import { localePath } from "@/i18n/routing";
import { routes, keyboardShortcuts } from "@/lib/constants";
import { applyTheme } from "@/lib/utils/theme-utils";
import { useMounted, isTypingInInput, useDebounce } from "@/hooks";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Calendar, Clock, Code, FileText,
  FlipHorizontal, Gamepad2, Home, Languages, Mail, MessagesSquare, Moon, RefreshCw,
  Search, Slash, Sun, Tag, User, Wrench, X
} from "lucide-preact";

// Inline KeyboardShortcut component
const KeyboardShortcut = ({ children }: { children: JSX.Element | string | number }) => (
  <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border font-mono">
    {children}
  </kbd>
);

// Helpers
const dispatchKey = (key: string) => document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
const scrollTo = (id: string, block: ScrollLogicalPosition = "start") => {
  const el = document.getElementById(id) || document.querySelector(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block });
    el.classList.add("ring-2", "ring-primary", "ring-offset-2");
    setTimeout(() => el.classList.remove("ring-2", "ring-primary", "ring-offset-2"), 1000);
  }
};

interface Action {
  id: string;
  label: string;
  icon: JSX.Element;
  shortcut?: string;
  category: string;
  action: () => void;
  description?: string;
  showOn?: string[];
}

export interface CommandBarProps {
  initialOpen?: boolean;
}

export function CommandBar({ initialOpen = false }: CommandBarProps) {
  const [theme, setThemeState] = useState<string>("dark");
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mounted = useMounted();
  const [pathname, setPathname] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 200);
  const lang = getPageLocale();

  useEffect(() => {
    setPathname(window.location.pathname);
    setThemeState(localStorage.getItem("theme") || "dark");
  }, []);

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  }, []);

  const t = useCallback(
    (key: string, fallbackOrParams?: string | Record<string, any>): string => {
      const isParams = fallbackOrParams && typeof fallbackOrParams === "object";
      const translated = isParams
        ? i18nT(key, fallbackOrParams as Record<string, any>)
        : i18nT(key);

      if (translated === key && typeof fallbackOrParams === "string") return fallbackOrParams;
      return translated;
    },
    // Re-render translations on language changes.
    [lang],
  );

  // Build all actions
  const allActions = useMemo(() => {
    const isPage = (p: string) => pathname?.includes(p);
    const close = () => setOpen(false);
    const locale = getPageLocale();
    const nav = (path: string) => () => { window.location.href = localePath(locale, path); close() };

    // Helper for keyboard-dispatch actions
    const keyAction = (id: string, label: string, icon: JSX.Element, shortcut: string, category: string, key: string, showOn: string[]): Action => ({
      id, label, icon, shortcut, category, action: () => { dispatchKey(key); close(); }, showOn,
    });

    // Navigation actions (data-driven)
    const navIcons: Record<string, JSX.Element> = {
      home: <Home className="h-4 w-4 text-primary" />,
      about: <User className="h-4 w-4 text-primary" />,
      projects: <Code className="h-4 w-4 text-primary" />,
      blog: <BookOpen className="h-4 w-4 text-primary" />,
      now: <Clock className="h-4 w-4 text-primary" />,
      uses: <Wrench className="h-4 w-4 text-primary" />,
      contact: <Mail className="h-4 w-4 text-primary" />,
      guestbook: <MessagesSquare className="h-4 w-4 text-primary" />,
      colophon: <FileText className="h-4 w-4 text-primary" />,
      webring: <FlipHorizontal className="h-4 w-4 text-primary" />,
      scrapbook: <Calendar className="h-4 w-4 text-primary" />,
      slashes: <Slash className="h-4 w-4 text-primary" />,
      brand: <Tag className="h-4 w-4 text-primary" />,
      tools: <Wrench className="h-4 w-4 text-primary" />,
    };
    const navCategory = t("keyboardShortcuts.navigation", "Navigation");
    const navItems: Action[] = Object.entries(navIcons).map(([id, icon]) => ({
      id,
      label: t(`nav.${id}`, id.charAt(0).toUpperCase() + id.slice(1)),
      icon,
      shortcut: keyboardShortcuts[id],
      category: navCategory,
      action: nav(routes[id as keyof typeof routes] || `/${id}/`),
    }));

    // Theme + language
    const themeActions: Action[] = [
      {
        id: "theme-toggle",
        label: theme === "dark" ? t("actionSearch.switchLightMode", "Light mode") : t("actionSearch.switchDarkMode", "Dark mode"),
        icon: theme === "dark" ? (<Sun className="h-4 w-4 text-yellow-500" />) : (<Moon className="h-4 w-4 text-blue-500" />),
        shortcut: "m",
        category: t("actionSearch.appearance", "Appearance"),
        action: () => { setTheme(theme === "dark" ? "light" : "dark"); close(); },
      },
      {
        id: "language-toggle",
        label: t("actionSearch.cycleLanguage", "Change language"),
        icon: <Languages className="h-4 w-4 text-green-500" />,
        shortcut: "y",
        category: t("blog.language", "Language"),
        action: () => { cycleLanguage(); close(); },
      },
    ];

    // General actions
    const generalActions: Action[] = [
      {
        id: "refresh-cat",
        label: t("keyboardShortcuts.refreshCat", "Refresh mood cat"),
        icon: <RefreshCw className="h-4 w-4 text-purple-500" />,
        shortcut: "r",
        category: t("actionSearch.fun", "Fun"),
        action: () => {
          document.querySelector('button[aria-label="Refresh mood cat"]')
            ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          close();
        },
      },
      {
        id: "tetris",
        label: t("actionSearch.tetris", "Play Tetris"),
        icon: <Gamepad2 className="h-4 w-4 text-red-500" />,
        shortcut: "t",
        category: t("actionSearch.games", "Games"),
        action: nav("/tetris/"),
      },
      {
        id: "2048",
        label: t("actionSearch.2048", "Play 2048"),
        icon: <Gamepad2 className="h-4 w-4 text-orange-500" />,
        shortcut: "z",
        category: t("actionSearch.games", "Games"),
        action: nav("/2048/"),
      },
    ];

    // Project page actions
    const projCat = t("actionSearch.projects.category", "Projects");
    const blueArrow = "h-4 w-4 text-blue-500";
    const projectActions: Action[] = !isPage("/projects") ? [] : [
      {
        id: "close-card",
        label: t("actionSearch.projects.closeCard", "Close card"),
        icon: <X className="h-4 w-4 text-red-500" />,
        shortcut: "Esc",
        category: projCat,
        action: () => {
          document.querySelector('.rotate-y-180 [id^="project-card-back-"]')
            ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          close();
        },
        showOn: ["/projects"],
      },
      keyAction("nav-left", t("actionSearch.projects.left", "Navigate left"), <ArrowLeft className={blueArrow} />, "←", projCat, "ArrowLeft", ["/projects"]),
      keyAction("nav-right", t("actionSearch.projects.right", "Navigate right"), <ArrowRight className={blueArrow} />, "→", projCat, "ArrowRight", ["/projects"]),
      keyAction("nav-up", t("actionSearch.projects.up", "Navigate up"), <ArrowUp className={blueArrow} />, "↑", projCat, "ArrowUp", ["/projects"]),
      keyAction("nav-down", t("actionSearch.projects.down", "Navigate down"), <ArrowDown className={blueArrow} />, "↓", projCat, "ArrowDown", ["/projects"]),
    ];

    // Blog actions
    const blogCat = t("actionSearch.blog.category", "Blog");
    const blogActions: Action[] = !isPage("/blog")
      ? []
      : pathname !== "/blog" && pathname !== "/blog/"
        ? [
            keyAction("blog-prev", t("actionSearch.blog.prev", "Previous"), <ArrowLeft className={blueArrow} />, "h", blogCat, "h", ["/blog/"]),
            keyAction("blog-next", t("actionSearch.blog.next", "Next"), <ArrowRight className={blueArrow} />, "l", blogCat, "l", ["/blog/"]),
            { id: "blog-back", label: t("actionSearch.blog.back", "Back to list"), icon: <ArrowLeft className={blueArrow} />, shortcut: "b", category: blogCat, action: nav("/blog/"), showOn: ["/blog/"] },
          ]
        : [
            keyAction("blog-down", t("actionSearch.blog.next", "Next post"), <ArrowDown className={blueArrow} />, "j", blogCat, "j", ["/blog"]),
            keyAction("blog-up", t("actionSearch.blog.prev", "Previous post"), <ArrowUp className={blueArrow} />, "k", blogCat, "k", ["/blog"]),
            {
              id: "blog-search",
              label: t("actionSearch.blog.search", "Search"),
              icon: <Search className="h-4 w-4 text-blue-500" />,
              shortcut: "s",
              category: blogCat,
              action: () => { (document.querySelector('input[placeholder*="Search"]') as HTMLInputElement)?.focus(); close(); },
              showOn: ["/blog"],
            },
            {
              id: "blog-filter",
              label: t("actionSearch.blog.filterTag", "Filter"),
              icon: <Tag className="h-4 w-4 text-green-500" />,
              category: blogCat,
              action: () => { document.querySelector("button:has(.lucide-filter)")?.dispatchEvent(new MouseEvent("click", { bubbles: true })); close(); },
              showOn: ["/blog"],
            },
          ];

    // About page - chapters 1-5
    const aboutActions: Action[] = !isPage("/about")
      ? []
      : [1, 2, 3, 4, 5].map((i) => ({
          id: `chapter-${i}`,
          label: t("actionSearch.about.jumpToChapter", { i }),
          icon: <BookOpen className="h-4 w-4 text-green-500" />,
          shortcut: `${i}`,
          category: t("actionSearch.about.category", "About"),
          action: () => { scrollTo(`chapter-${i}`, "center"); close(); },
          showOn: ["/about"],
        }));

    // Scroll-to-category helper for multiple pages
    const scrollActions = (
      page: string, items: string[], i18nPrefix: string, catKey: string,
      icon: JSX.Element, selectorFn: (item: string, idx: number) => string,
    ): Action[] => !isPage(page) ? [] : items.map((item, idx) => {
      const label = t(`${i18nPrefix}.${item}`, item);
      const shortcut = idx < 9 ? `${idx + 1}` : idx === 9 ? "0" : "-";
      return {
        id: `${page.slice(1)}-${idx}`,
        label: t(`actionSearch.${page.slice(1)}.jumpToCategory`, { category: label })
          || t(`actionSearch.${page.slice(1)}.jumpToSection`, { section: label }),
        icon, shortcut,
        category: t(`actionSearch.${page.slice(1)}.category`, catKey),
        action: () => { scrollTo(selectorFn(item, idx)); close(); },
        showOn: [page],
      };
    });

    const nowActions = scrollActions(
      "/now",
      ["reading", "coding", "drinking", "listening", "thinking", "studying", "planning"],
      "now.categories", "Now",
      <Clock className="h-4 w-4 text-green-500" />,
      (cat) => `category-${cat}`,
    );

    const usesActions = scrollActions(
      "/uses",
      ["hardware", "mobile", "audio", "os", "development", "email", "privacy", "mobile_tools", "mapping", "gaming", "multimedia"],
      "uses.categories", "Uses",
      <Wrench className="h-4 w-4 text-blue-500" />,
      (_cat, idx) => `[id^="category-"]:nth-of-type(${idx + 1})`,
    );

    const colophonActions = scrollActions(
      "/colophon",
      ["siteHistory", "technologyStack", "hosting", "inspiration"],
      "colophon", "Colophon",
      <FileText className="h-4 w-4 text-purple-500" />,
      (_sec, idx) => `[id^="section-"]:nth-of-type(${idx + 1})`,
    );

    return [
      ...navItems,
      ...themeActions,
      ...generalActions,
      ...projectActions,
      ...blogActions,
      ...aboutActions,
      ...nowActions,
      ...usesActions,
      ...colophonActions,
    ].filter((a) => !a.showOn || a.showOn.some((p) => pathname?.includes(p)));
  }, [t, theme, setTheme, lang, pathname]);

  // Filter by query
  const filteredActions = useMemo(() => {
    if (!debouncedQuery) return allActions;
    const q = debouncedQuery.toLowerCase();
    return allActions.filter((a) =>
      `${a.label} ${a.description || ""}`.toLowerCase().includes(q),
    );
  }, [allActions, debouncedQuery]);

  // Group by category
  const groupedActions = useMemo(
    () =>
      filteredActions.reduce(
        (acc, a) => {
          (acc[a.category] ||= []).push(a);
          return acc;
        },
        {} as Record<string, Action[]>,
      ),
    [filteredActions],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Skip if typing in input (except for our search input)
      const el = document.activeElement;
      if (el !== inputRef.current && isTypingInInput()) return;

      if (e.key === "." && !open && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredActions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (i) => (i - 1 + filteredActions.length) % filteredActions.length,
        );
      } else if (e.key === "Enter" && filteredActions.length) {
        e.preventDefault();
        filteredActions[selectedIndex].action();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, filteredActions, selectedIndex]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      {/* Dialog backdrop and content */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Dialog content */}
          <div
            className="relative bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={t("actionSearch.placeholder", "Search actions...")}
          >
            {/* Search input */}
            <div className="p-4 pb-2">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t(
                    "actionSearch.placeholder",
                    "Search actions...",
                  )}
                  aria-label={t("actionSearch.placeholder", "Search actions...")}
                  value={query}
                  onChange={(e) => {
                    setQuery((e.target as HTMLInputElement).value);
                    setSelectedIndex(0);
                  }}
                  className="w-full pl-10 pr-4 h-10 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredActions.length > 0 ? (
                <div className="pb-2 animate-in fade-in duration-200">
                  {Object.entries(groupedActions).map(([category, actions]) => (
                    <div key={category} className="px-2">
                      <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                        {category}
                      </div>
                      {actions.map((a) => {
                        const idx = filteredActions.findIndex(
                          (x) => x.id === a.id,
                        );
                        return (
                          <div
                            key={a.id}
                            className={`px-2 py-1.5 flex items-center justify-between rounded-md cursor-pointer transition-colors ${idx === selectedIndex ? "bg-muted" : "hover:bg-muted/50"}`}
                            onClick={() => a.action()}
                            onMouseEnter={() => setSelectedIndex(idx)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex-shrink-0">{a.icon}</span>
                              <span className="text-sm font-medium">
                                {a.label}
                              </span>
                              {a.description && (
                                <span className="text-xs text-muted-foreground">
                                  {a.description}
                                </span>
                              )}
                            </div>
                            {a.shortcut && (
                              <KeyboardShortcut>{a.shortcut}</KeyboardShortcut>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center animate-in fade-in duration-200">
                  <p className="text-muted-foreground">
                    {t("actionSearch.noResults", "No actions found")}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                <span>
                  {t(
                    "actionSearch.pressToOpen",
                    "Press . to open command palette",
                  )}
                </span>
                <span>{t("actionSearch.escToClose", "ESC to close")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
