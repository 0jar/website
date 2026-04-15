// Site constants

export const siteUrl = "https://jarema.me";
export const siteName = "Jarema's digital garden";
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
  country: "Vietnam/Estonia",
  category: "student",
  lastFmUsername: "jerryvu",
  iMoodUsername: "jarema",
  statusCafeUsername: "jarema",
} as const;

// Social media and identity links
export const socialLinks = {
  github: "https://github.com/jartf",
  pronounsPage: "https://pronouns.page/@jerryv",
} as const;

// Alternative domains/mirrors
export const alternativeDomains = ["https://jar.tf", "https://z.is-a.dev"] as const;

// External services configuration
export const services = {
  // Comments
  cusdis: {
    host: "https://cusdis.com",
    scriptUrl: "https://cusdis.com/js/cusdis.es.js",
    appId: "8b37c4ca-e35d-429e-8f80-6c47e93ab5cd",
  },
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
  { code: "ru", name: "Русский", flag: "🇷🇺", main: true, aliases: ["Russian", "Russkii", "Russkiy"] },
  { code: "et", name: "Eesti", flag: "🇪🇪", main: true, aliases: ["Estonian"] },
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

export const footerBadges: FooterBadge[] = [
  {
    src: "/sweet.png",
    alt: "Sweet homepage",
  },
  {
    src: "/best_viewed_with_eyes.gif",
    alt: "Best viewed with Eyes",
  },
  {
    src: "/dumbass.gif",
    alt: "Dumbass webmaster ahead",
  },
  {
    src: "/join_logo.gif",
    alt: "White cat sleeping on a red pillow, miaow",
  },
  {
    src: "/bannars.gif",
    alt: "The Realm of Dream",
  },
  {
    src: "/clouds.gif",
    alt: "Clouds are nice",
  },
  {
    src: "/people_pledge_badge_party_cream_pink_88x31.png",
    alt: "People Pledge",
    href: "https://people.pledge.party/",
  },
  {
    src: "/kagi-smallweb-yellow.gif",
    alt: "Kagi Small Web",
    href: "https://kagi.com/smallweb",
  },
  {
    src: "/internetprivacy.gif",
    alt: "Internet privacy Now!",
  },
  {
    src: "/saynotoweb3_88x31.gif",
    alt: "Keep the web free, say no to Web3",
    href: "https://yesterweb.org/no-to-web3/",
  },
  {
    src: "/humanstxt.png",
    alt: "Humans.txt",
    href: "/humans.txt",
  },
  { src: "/got_html.gif", alt: "Got HTML?" },
  {
    src: "/js-warning.gif",
    alt: "Page contains JavaScript!",
  },
  {
    src: "/fedora.gif",
    alt: "Fedora Linux",
    href: "https://fedoraproject.org/",
  },
];

// Friend/recommended site badges
export const friendSites: FooterBadge[] = [
  { src: "/lukedavis.gif", alt: "Luke Davis's site", href: "https://lukealexdavis.co.uk/" },
  { src: "/nogginzmart.gif", alt: "Nogginzmart's site", href: "https://nogginzmart.neocities.org" },
  { src: "/ww-88x31-right-black.png", alt: "Web Weavers invite link", href: "https://discord.gg/qePupaKk" },
  { src: "/espy-world-button.gif", alt: "Espy's site", href: "https://espy.world/" },
  { src: "/melonland-badge-2.gif", alt: "MelonLand Forum", href: "https://forum.melonland.net/" },
];

// API configuration
export const domainHashes: Record<string, string> = {
  "jarema.me": "dh=1d651c707c7a9a0d03b235429393417f9506161c",
  "z.is-a.dev": "dh=151caf0b951e4ef19ec7ca771079fbed44c28970",
  localhost: "dh=2147463847test",
};

// Timezone
export const authorTimezone = "Antarctica/Davis";
export const authorTimezoneLabel = "Davis, 🇦🇶";

export const preMidConfig = {
  authorizedUserId: "490457129090547733",
  activityTimeoutMs: 20 * 60 * 1000,
  clearThresholdMs: 2 * 60 * 1000,
  productionHosts: new Set(["jarema.me", "www.jarema.me"]),
  maxActivities: 20,
  productionApiUrl: "https://jarema.me/api/premid",
  apiTimeoutMs: 5000,
};
