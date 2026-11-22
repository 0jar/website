import { getPageLocale, cycleLanguage, t } from "@/i18n/client";
import { localePath, stripLocale } from "@/i18n/routing";
import { applyTheme } from "@/lib/utils/theme";
import { keyboardShortcuts, routes } from "@/lib/constants";
import { icons } from "./icons";

type IconName = keyof typeof icons;
export const Icon = ({ name, className = "w-4 h-4" }: { name: IconName; className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" class={className} fill="none" stroke="currentColor" stroke-width="2"
    dangerouslySetInnerHTML={{ __html: icons[name] }} />
);

export interface Action {
  id: string;
  label: string;
  category: string;
  icon: IconName;
  shortcut?: string;
  run: () => void;
}

const navIcons = {
  home: "home", about: "user", projects: "code", blog: "book-open", now: "clock", uses: "wrench",
  contact: "mail", guestbook: "message-square", colophon: "file-text", webring: "flip-horizontal-2",
  scrapbook: "calendar", slashes: "slash", brand: "tag", tools: "wrench",
} as const;

export function getActions(): Action[] {
  const path = stripLocale(location.pathname);
  const navigate = (href: string) => () => location.assign(localePath(getPageLocale(), href));
  const actions: Action[] = (Object.keys(navIcons) as (keyof typeof navIcons)[]).map(id => ({
    id, category: t("keyboardShortcuts.navigation"), label: t(`nav.${id}`), icon: navIcons[id],
    shortcut: keyboardShortcuts[id], run: navigate(routes[id]),
  }));
  const add = (id: string, label: string, icon: IconName, category: string, run: () => void, shortcut?: string) =>
    actions.push({ id, label, icon, category, run, shortcut });

  const dark = document.documentElement.classList.contains("dark");
  add("theme", t(dark ? "actionSearch.switchLightMode" : "actionSearch.switchDarkMode"), dark ? "sun" : "moon",
    t("actionSearch.appearance"), () => applyTheme(dark ? "light" : "dark"), "m");
  if (document.getElementById("lang-toggle")) {
    add("language", t("actionSearch.cycleLanguage"), "languages", t("actionSearch.appearance"), cycleLanguage, "y");
  }
  const refresh = document.querySelector<HTMLButtonElement>("mood-cat [data-refresh]");
  if (refresh) add("refresh-cat", t("keyboardShortcuts.refreshCat"), "refresh-cw", t("actionSearch.fun"), () => refresh.click(), "r");
  add("tetris", t("actionSearch.tetris"), "gamepad-2", t("actionSearch.games"), navigate(routes.tetris), "t");
  add("2048", t("actionSearch.2048"), "gamepad-2", t("actionSearch.games"), navigate(routes.game2048), "z");

  const blog = t("actionSearch.blog.category");
  if (path === routes.blog) {
    add("search", t("actionSearch.blog.search"), "search", blog, () => document.getElementById("blog-search")?.focus());
    add("filter", t("actionSearch.blog.filterTag"), "tag", blog, () => document.getElementById("filter-button")?.click());
    for (const direction of ["next", "prev"] as const) {
      add(direction, t(`actionSearch.blog.${direction}`), direction === "next" ? "arrow-down" : "arrow-up", blog, () => {
        const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".blog-post:not([hidden]) > a"));
        const current = links.findIndex(link => link === document.activeElement);
        const next = direction === "next" ? current + 1 : current <= 0 ? links.length - 1 : current - 1;
        links[next % links.length]?.focus();
      });
    }
  } else if (path.startsWith(routes.blog)) {
    for (const dir of ["prev", "next"] as const) {
      const link = document.querySelector<HTMLAnchorElement>(`main a[rel="${dir}"]`);
      if (link) add(dir, t(`actionSearch.blog.${dir}`), dir === "prev" ? "arrow-left" : "arrow-right", blog, () => link.click());
    }
    add("back", t("actionSearch.blog.back"), "arrow-left", blog, navigate(routes.blog), "b");
  }

  if (path === routes.projects) {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".project-card")).filter(card => card.offsetWidth);
    const category = t("actionSearch.projects.category");
    const open = cards.find(card => card.querySelector(".flipped"));
    if (open) add("close-card", t("actionSearch.projects.closeCard"), "x", category, () => open.click());
    for (const dir of ["left", "right", "up", "down"] as const) {
      add(dir, t(`actionSearch.projects.${dir}`), `arrow-${dir}`, category, () => {
        const card = cards.find(el => el.contains(document.activeElement)) ?? cards[0];
        card?.focus();
        card?.dispatchEvent(new KeyboardEvent("keydown", { key: `Arrow${dir[0].toUpperCase()}${dir.slice(1)}`, bubbles: true }));
      });
    }
  }

  const sections: Record<string, string> = {
    [routes.about]: "main article", [routes.now]: "#now-items-container article",
    [routes.uses]: "main section[id]", [routes.colophon]: "main section[id]",
  };
  if (sections[path]) {
    const section = path.split("/")[1];
    document.querySelectorAll<HTMLElement>(sections[path]).forEach((el, i) => {
      const label = el.querySelector("h2, h3")?.textContent?.trim();
      if (label) add(`section-${i}`, label, "book-open", t(`actionSearch.${section}.category`), () => {
        el.tabIndex = -1;
        el.focus({ preventScroll: true });
        el.scrollIntoView({ block: "center" });
      });
    });
  }
  return actions;
}
