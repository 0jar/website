import { useMemo, useCallback, useState, useEffect } from "preact/hooks";
import type { JSX } from "preact";
import { getPageLocale, cycleLanguage, t as i18nT } from "@/i18n/client";
import { localePath } from "@/i18n/routing";
import { applyTheme } from "@/lib/utils/theme-utils";
import { keyboardShortcuts, routes } from "@/lib/constants";
import { icons } from "./icons";

export const PreactIcon = ({ name, className = "w-4 h-4" }: { name: keyof typeof icons, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    dangerouslySetInnerHTML={{ __html: icons[name] }}
  />
);

const dispatchKey = (key: string) => document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
const scrollTo = (id: string, block: ScrollLogicalPosition = "start") => {
  const el = document.getElementById(id) || document.querySelector(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block });
    el.classList.add("ring-2", "ring-primary", "ring-offset-2");
    setTimeout(() => el.classList.remove("ring-2", "ring-primary", "ring-offset-2"), 1000);
  }
};

export interface Action {
  id: string;
  label: string;
  icon: JSX.Element;
  shortcut?: string;
  category: string;
  action: () => void;
  description?: string;
  showOn?: string[];
}

const navIconsDef: Record<string, keyof typeof icons> = {
  home: "home",
  about: "user",
  projects: "code",
  blog: "book-open",
  now: "clock",
  uses: "wrench",
  contact: "mail",
  guestbook: "message-square",
  colophon: "file-text",
  webring: "flip-horizontal-2",
  scrapbook: "calendar",
  slashes: "slash",
  brand: "tag",
  tools: "wrench",
};

const nowCategories = ["reading", "coding", "drinking", "listening", "thinking", "studying", "planning"];
const usesCategories = ["hardware", "mobile", "audio", "os", "development", "email", "privacy", "mobile_tools", "mapping", "gaming", "multimedia"];
const colophonSections = ["siteHistory", "technologyStack", "hosting", "inspiration"];

export function useCommandActions(
  pathname: string,
  setOpen: (open: boolean) => void
) {
  const [theme, setThemeState] = useState<string>("dark");
  const lang = getPageLocale();

  useEffect(() => {
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
    [lang],
  );

  const allActions = useMemo(() => {
    const isPage = (p: string) => pathname?.includes(p);
    const close = () => setOpen(false);
    const locale = getPageLocale();
    const nav = (path: string) => () => { window.location.href = localePath(locale, path); close(); };

    const keyAction = (id: string, label: string, icon: JSX.Element, shortcut: string, category: string, key: string, showOn: string[]): Action => ({
      id, label, icon, shortcut, category, action: () => { dispatchKey(key); close(); }, showOn,
    });

    const navCategory = t("keyboardShortcuts.navigation", "Navigation");
    const navItems: Action[] = Object.entries(navIconsDef).map(([id, iconName]) => ({
      id,
      label: t(`nav.${id}`, id.charAt(0).toUpperCase() + id.slice(1)),
      icon: <PreactIcon name={iconName} />,
      shortcut: keyboardShortcuts[id as keyof typeof keyboardShortcuts],
      category: navCategory,
      action: nav(routes[id as keyof typeof routes] || `/${id}/`),
    }));

    const themeActions: Action[] = [
      {
        id: "theme-toggle",
        label: theme === "dark" ? t("actionSearch.switchLightMode", "Light mode") : t("actionSearch.switchDarkMode", "Dark mode"),
        icon: theme === "dark" ? (<PreactIcon name="sun" />) : (<PreactIcon name="moon" />),
        shortcut: "m",
        category: t("actionSearch.appearance", "Appearance"),
        action: () => { setTheme(theme === "dark" ? "light" : "dark"); close(); },
      },
      {
        id: "language-toggle",
        label: t("actionSearch.cycleLanguage", "Change language"),
        icon: <PreactIcon name="languages" />,
        shortcut: "y",
        category: t("blog.language", "Language"),
        action: () => { cycleLanguage(); close(); },
      },
    ];

    const generalActions: Action[] = [
      {
        id: "refresh-cat",
        label: t("keyboardShortcuts.refreshCat", "Refresh mood cat"),
        icon: <PreactIcon name="refresh-cw" />,
        shortcut: "r",
        category: t("actionSearch.fun", "Fun"),
        action: () => {
          document.querySelector('button[aria-label="Refresh mood cat"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          close();
        },
      },
      {
        id: "tetris",
        label: t("actionSearch.tetris", "Play Tetris"),
        icon: <PreactIcon name="gamepad-2" />,
        shortcut: "t",
        category: t("actionSearch.games", "Games"),
        action: nav("/tetris/"),
      },
      {
        id: "2048",
        label: t("actionSearch.2048", "Play 2048"),
        icon: <PreactIcon name="gamepad-2" />,
        shortcut: "z",
        category: t("actionSearch.games", "Games"),
        action: nav("/2048/"),
      },
    ];

    const projCat = t("actionSearch.projects.category", "Projects");
    const projectActions: Action[] = !isPage("/projects") ? [] : [
      {
        id: "close-card",
        label: t("actionSearch.projects.closeCard", "Close card"),
        icon: <PreactIcon name="x" />,
        shortcut: "Esc",
        category: projCat,
        action: () => { document.querySelector('.rotate-y-180 [id^="project-card-back-"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true })); close(); },
        showOn: ["/projects"],
      },
      keyAction("nav-left", t("actionSearch.projects.left", "Navigate left"), <PreactIcon name="arrow-left" />, "←", projCat, "ArrowLeft", ["/projects"]),
      keyAction("nav-right", t("actionSearch.projects.right", "Navigate right"), <PreactIcon name="arrow-right" />, "→", projCat, "ArrowRight", ["/projects"]),
      keyAction("nav-up", t("actionSearch.projects.up", "Navigate up"), <PreactIcon name="arrow-up" />, "↑", projCat, "ArrowUp", ["/projects"]),
      keyAction("nav-down", t("actionSearch.projects.down", "Navigate down"), <PreactIcon name="arrow-down" />, "↓", projCat, "ArrowDown", ["/projects"]),
    ];

    const blogCat = t("actionSearch.blog.category", "Blog");
    const blogActions: Action[] = !isPage("/blog") ? [] : pathname !== "/blog" && pathname !== "/blog/" ? [
      keyAction("blog-prev", t("actionSearch.blog.prev", "Previous"), <PreactIcon name="arrow-left" />, "h", blogCat, "h", ["/blog/"]),
      keyAction("blog-next", t("actionSearch.blog.next", "Next"), <PreactIcon name="arrow-right" />, "l", blogCat, "l", ["/blog/"]),
      { id: "blog-back", label: t("actionSearch.blog.back", "Back to list"), icon: <PreactIcon name="arrow-left" />, shortcut: "b", category: blogCat, action: nav("/blog/"), showOn: ["/blog/"] },
    ] : [
      keyAction("blog-down", t("actionSearch.blog.next", "Next post"), <PreactIcon name="arrow-down" />, "j", blogCat, "j", ["/blog"]),
      keyAction("blog-up", t("actionSearch.blog.prev", "Previous post"), <PreactIcon name="arrow-up" />, "k", blogCat, "k", ["/blog"]),
      { id: "blog-search", label: t("actionSearch.blog.search", "Search"), icon: <PreactIcon name="search" />, shortcut: "s", category: blogCat, action: () => { (document.querySelector('input[placeholder*="Search"]') as HTMLInputElement)?.focus(); close(); }, showOn: ["/blog"] },
      { id: "blog-filter", label: t("actionSearch.blog.filterTag", "Filter"), icon: <PreactIcon name="tag" />, category: blogCat, action: () => { document.querySelector("button:has(.lucide-filter)")?.dispatchEvent(new MouseEvent("click", { bubbles: true })); close(); }, showOn: ["/blog"] },
    ];

    const aboutActions: Action[] = !isPage("/about") ? [] : [1, 2, 3, 4, 5].map((i) => ({
      id: `chapter-${i}`,
      label: t("actionSearch.about.jumpToChapter", { i: i.toString() }),
      icon: <PreactIcon name="book-open" />,
      shortcut: `${i}`,
      category: t("actionSearch.about.category", "About"),
      action: () => { scrollTo(`chapter-${i}`, "center"); close(); },
      showOn: ["/about"],
    }));

    const scrollActions = (
      page: string, items: string[], i18nPrefix: string, catKey: string,
      icon: JSX.Element, selectorFn: (item: string, idx: number) => string,
    ): Action[] => !isPage(page) ? [] : items.map((item, idx) => {
      const label = t(`${i18nPrefix}.${item}`, item);
      const shortcut = idx < 9 ? `${idx + 1}` : idx === 9 ? "0" : "-";
      return {
        id: `${page.slice(1)}-${idx}`,
        label: t(`actionSearch.${page.slice(1)}.jumpToCategory`, { category: label }) || t(`actionSearch.${page.slice(1)}.jumpToSection`, { section: label }),
        icon, shortcut,
        category: t(`actionSearch.${page.slice(1)}.category`, catKey),
        action: () => { scrollTo(selectorFn(item, idx)); close(); },
        showOn: [page],
      };
    });

    const nowActions = scrollActions("/now", nowCategories, "now.categories", "Now", <PreactIcon name="clock" />, (cat) => `category-${cat}`);
    const usesActions = scrollActions("/uses", usesCategories, "uses.categories", "Uses", <PreactIcon name="wrench" />, (_cat, idx) => `[id^="category-"]:nth-of-type(${idx + 1})`);
    const colophonActions = scrollActions("/colophon", colophonSections, "colophon", "Colophon", <PreactIcon name="file-text" />, (_sec, idx) => `[id^="section-"]:nth-of-type(${idx + 1})`);

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
  }, [t, theme, setTheme, pathname, setOpen]);

  return { allActions, t };
}
