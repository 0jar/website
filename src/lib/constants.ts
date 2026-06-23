// Site constants

export const siteUrl = "https://jarema.me";
export const siteName = "Jarema's digital garden";
export const getSiteName = (lang?: string) => {
  if (lang === "vi") return "Vườn số nhà Jarema";
  if (lang === "ru") return "Цифровой сад Яремы";
  if (lang === "et") return "Jarema digiaed";
  if (lang === "da") return "Jaremas digitalhave";
  if (lang === "zh") return "承靖的数字花园";
  if (lang === "pl") return "Cyfrowy ogród Jaremy";
  if (lang === "tok") return "ma kasi pi jan Jalema";
  return siteName;
};
export const siteDescription = "This site is the personal playground and digital garden for Jarema. I write some blog posts, sometimes content about economics, coding, and occasionally I post some cats too.";
export const siteKeywords = "Jarema, jartf, digital garden, personal website, blog, economics, coding, tech, multilingual, student, cat, personal blog, digital playground, independent blog, independent writer, indie web, technology, now page, about page, personal reflections, ideas, thoughts, observation journal, how to build a personal site, economics and coding personal site";

// Author/Person constants
export const author = {
  name: "Jarema",
  displayName: "∴ Jarema",
  email: "hello@jarema.me",
  note: "Economics major, sometimes coder, most times cat whisperer.",
  image: "/favicons-128.png",
  keyUrl: "/keys/gpg",
  repoUrl: "https://codeberg.org/0jar/website",
  repoOwner: "0jar",
  repoName: "website",
  country: "Vietnam/Estonia",
  category: "student",
  lastFmUsername: "jerryvu",
  iMoodUsername: "jarema",
  statusCafeUsername: "jarema",
} as const;

// Social media and identity links
export const socialLinks = {
  codeberg: "https://codeberg.org/jartf",
  github: "https://github.com/jartf",
  pronounsPage: "https://pronouns.page/@jerryv",
  fediverse: ["@jar@blob.cat", "@jar@toot.io", "@jarema@mas.to"],
} as const;

// Alternative domains/mirrors
export const alternativeDomains = ["https://jar.tf", "https://z.is-a.dev"] as const;

// External services configuration
export const services = {
  // IndieAuth
  indieAuth: {
    authEndpoint: "https://indieauth.com/auth",
    tokenEndpoint: "https://tokens.indieauth.com/token",
  },
  // Webmention
  webmention: {
    endpoint: "https://webmention.io/jarema.me/webmention",
    microsubEndpoint: "https://aperture.p3k.io/microsub/1060",
    pingbackEndpoint: "https://webmention.io/jarema.me/xmlrpc",
  },
  // Last.fm
  lastFm: {
    apiUrl: "https://ws.audioscrobbler.com/2.0/",
    apiKey: "c8526c48e3bd3c6f35e365480426f1be",
  },
  // iMood
  iMood: {
    profileUrl: "https://www.imood.com/users/jarema",
    widgetUrl: "https://moods.imood.com/display/uname-jarema/fg-F2F2F2/bg-1A0F2E/imood.gif",
  },
  // status.cafe
  statusCafe: {
    profileUrl: "https://status.cafe/users/jarema",
  },
  // Analytics (Umami)
  analytics: {
    scriptUrl: "/stats/script.js",
    websiteIds: {
      "jarema.me": "2e9dfa41-fbe7-4799-9adb-0a57b8141a54",
      "z.is-a.dev": "bea729d4-bbf9-494e-a4d9-bcbf2a2ab2f3",
    },
  },
  // Chat
  iframeChat: {
    host: "https://iframe.chat/embed?chat=jaremame",
    scriptUrl: "https://iframe.chat/scripts/main.min.js",
  },
} as const;

// Theme colors
export const themeColors = {
  dark: "#1A0F2E",
  light: "#FFFFFF",
} as const;

// Pride flag colors (for footer)
export const flagColors = {
  pink: "#D60270",
  purple: "#9B4F96",
  blue: "#0038A8",
} as const;

// Supported languages
export const supportedLanguages = [
  { code: "en", name: "English", flag: "🇬🇧", main: true, aliases: ["English"] },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳", main: true, aliases: ["Vietnamese", "Tieng Viet"] },
  { code: "et", name: "Eesti", flag: "🇪🇪", main: true, aliases: ["Estonian"] },
  { code: "ru", name: "Русский", flag: "🇷🇺", main: true, aliases: ["Russian", "Russkii", "Russkiy"] },
  { code: "da", name: "Dansk", flag: "🇩🇰", main: true, aliases: ["Danish"] },
  { code: "zh", name: "中文", flag: "🇨🇳", main: true, aliases: ["Chinese", "Zhongwen", "Hanyu"] },
  { code: "tr", name: "Türkçe", flag: "🇹🇷", beta: true, aliases: ["Turkish", "Turkce"] },
  { code: "pl", name: "Polski", flag: "🇵🇱", beta: true, aliases: ["Polish"] },
  { code: "sv", name: "Svenska", flag: "🇸🇪", beta: true, aliases: ["Swedish"] },
  { code: "fi", name: "Suomi", flag: "🇫🇮", beta: true, aliases: ["Finnish"] },
  { code: "tok", name: "toki pona", flag: "😇", other: true, aliases: ["language of the good"] },
  { code: "vi-Hani", name: "㗂越（漢喃）", flag: "🇻🇳", other: true, aliases: ["Vietnamese", "Han Nom", "Hannom"] },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]["code"];

// Languages for hreflang tags (excludes non-standard codes of tok and vi-Hani)
export const hrefLangLanguages = supportedLanguages.filter((l) => l.code !== "tok" && l.code !== "vi-Hani");

// Completed translations
export const completedLanguages = ["en", "vi", "et", "ru", "da"] as const;

// Map site language codes to Open Graph locale values
export const ogLocaleMap: Record<string, string> = {
  en: "en_US", vi: "vi_VN", "vi-Hani": "vi_VN", zh: "zh_CN", ru: "ru_RU",
  da: "da_DK", et: "et_EE", tr: "tr_TR", pl: "pl_PL", sv: "sv_SE",
  fi: "fi_FI", tok: "en_US",
};

// Theme constants
export const themes = ["light", "dark", "system"] as const;
export type Theme = (typeof themes)[number];

// Project configurations
export const projectIcons: Record<string, string> = { personal: "🧑‍💻", academic: "📚", activism: "✊" };
export const projectStatusConfig = [
  { key: "completed", bg: "bg-green-500", status: "completed" },
  { key: "inProgress", bg: "bg-yellow-500 animate-pulse", status: "in-progress" },
  { key: "planned", bg: "bg-blue-500", status: "planned" },
];

// Navigation routes
export const routes = {
  home: "/",
  about: "/about/",
  projects: "/projects/",
  blog: "/blog/",
  now: "/now/",
  uses: "/uses/",
  contact: "/contact/",
  guestbook: "/guestbook/",
  chat: "/chat/",
  colophon: "/colophon/",
  scrapbook: "/scrapbook/",
  webring: "/webrings/",
  slashes: "/slashes/",
  brand: "/brand/",
  tools: "/tools/",
  tetris: "/tetris/",
  game2048: "/2048/",
  retro: "/retro/",
  badges: "/badges/",
  blank: "/blank/",
} as const;

/**
 * Pages that get locale variants under /[locale]/[page].
 * Derived from `routes`, excluding `home` (handled by [locale]/index)
 * and `retro` (has its own sub-page routing).
 */
export const localePages = Object.values(routes)
  .filter((p) => p !== "/" && p !== "/retro/")
  .map((p) => p.replace(/^\//,  "").replace(/\/$/, ""));

// Keyboard shortcuts
export const nowIcons: Record<string, string> = {
  Headphones: "🎧", BookOpen: "📚", Code: "💻", Coffee: "☕",
  Brain: "🧠", GraduationCap: "🎓", Activity: "📡", Lightbulb: "💡",
};

export const usesIcons: Record<string, string> = {
  hardware: "💻", mobile: "📱", audio: "🎧", os: "🖥️", development: "⌨️",
  email: "📧", privacy: "🔒", mobile_tools: "🔧", mapping: "🗺️", gaming: "🎮",
  multimedia: "🎨", design: "🎨", photo: "📷", video: "🎬", media: "🎵",
};

export const keyboardShortcuts: Record<string, string> = {
  home: "h",
  about: "a",
  projects: "p",
  blog: "b",
  now: "n",
  uses: "u",
  contact: "c",
  guestbook: "g",
  colophon: "l",
  webring: "w",
  slashes: "/",
  scrapbook: "d",
  brand: "k",
  tools: "x",
  tetris: "t",
  game2048: "z",
  themeToggle: "m",
  languageToggle: "y",
  refreshCat: "r",
  commandPalette: ".",
  keyboardShortcuts: ",",
};

// Navigation items for header
export const navItems = [
  { href: routes.home, key: "home" },
  { href: routes.about, key: "about" },
  { href: routes.blog, key: "blog" },
  { href: routes.now, key: "now" },
  { href: routes.uses, key: "uses" },
  { href: routes.contact, key: "contact" },
  { href: routes.guestbook, key: "guestbook" },
  { href: routes.chat, key: "chat" },
  { href: routes.colophon, key: "colophon" },
  { href: routes.webring, key: "webring" },
  { href: routes.slashes, key: "slashes" },
] as const;

// Footer badges
export interface FooterBadge {
  src: string;
  alt: string;
  href?: string;
}

// API configuration
export const discordHash = "dh=1d651c707c7a9a0d03b235429393417f9506161c";

// Timezone
export const authorTimezone = "Antarctica/Davis";
export const authorTimezoneLabel = "Davis, 🇦🇶";
