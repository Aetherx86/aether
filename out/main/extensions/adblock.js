"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const https = require("node:https");
const http = require("node:http");

let electronApp = null;
let electronWebContents = null;
try {
  const electron = require("electron");
  electronApp = electron.app || null;
  electronWebContents = electron.webContents || null;
} catch {
  electronApp = null;
  electronWebContents = null;
}

// ============================================================================
// 1. BUILT-IN CURATED FILTER DATABASES (Offline-Ready, O(1) Hash Lookup)
// ============================================================================

const BUILTIN_AD_DOMAINS = [
  // Global Ad Exchanges & Serving Networks
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "adservice.google.com",
  "2mdn.net",
  "imasdk.googleapis.com",
  "adnxs.com",
  "adnxs-simple.com",
  "criteo.com",
  "criteo.net",
  "taboola.com",
  "trc.taboola.com",
  "outbrain.com",
  "outbrainimg.com",
  "zemanta.com",
  "rubiconproject.com",
  "pubmatic.com",
  "openx.net",
  "casalemedia.com",
  "adsrvr.org",
  "advertising.com",
  "amazon-adsystem.com",
  "aaxads.com",
  "teads.tv",
  "smartadserver.com",
  "indexexchange.com",
  "indexww.com",
  "3lift.com",
  "triplelift.com",
  "sharethrough.com",
  "bidswitch.net",
  "mgid.com",
  "revcontent.com",
  "adform.net",
  "adroll.com",
  "media.net",
  "yieldmo.com",
  "sovrn.com",
  "lijit.com",
  "gumgum.com",
  "kargo.com",
  "spotxchange.com",
  "spotx.tv",
  "springserve.com",
  "fwmrm.net",
  "innovid.com",
  "flashtalking.com",
  "celtra.com",
  "serving-sys.com",
  "zedo.com",
  "chitika.net",
  "infolinks.com",
  "revjet.com",
  "nativo.com",
  "connatix.com",
  "primis.tech",
  "aniview.com",
  "vidoomy.com",
  "sonobi.com",
  "districtm.io",
  "contextweb.com",
  "conversantmedia.com",
  "fastclick.net",
  "undertone.com",
  "exponential.com",
  "tribalfusion.com",
  "adition.com",
  "adtechus.com",
  "adblade.com",
  "adbrite.com",
  "adbureau.net",
  "adbutler.com",
  "adcolony.com",
  "addthis.com",
  "addtoany.com",
  "adentifi.com",
  "adhigh.net",
  "adkernel.com",
  "adlightning.com",
  "adloch.com",
  "admanmedia.com",
  "admarvel.com",
  "admixer.net",
  "admobs.com",
  "admob.com",
  "adhese.com",
  "adocean.pl",
  "adotmob.com",
  "adpushup.com",
  "adriver.ru",
  "adscale.de",
  "adspeed.net",
  "adspirit.de",
  "adswizz.com",
  "adtelligent.com",
  "adthrive.com",
  "mediavine.com",
  "ezoic.net",
  "ezodn.com",
  "freestar.io",
  "snigelweb.com",
  "playwire.com",
  "venatusmedia.com",
  "nitropay.com",
  "carbonads.com",
  "carbonads.net",
  "buysellads.com",
  "ethicalads.io",
  "unityads.unity3d.com",
  "applovin.com",
  "applvn.com",
  "vungle.com",
  "chartboost.com",
  "inmobi.com",
  "ironsrc.com",
  "fyber.com",
  "smaato.net",
  "mopub.com",
  "startappservice.com",
  "yandexadexchange.net",
  "an.yandex.ru",

  // Korean Regional Ad Networks (KR-Shield)
  "siape.veta.naver.com",
  "nv.veta.naver.com",
  "ader.naver.com",
  "ad.naver.com",
  "adcr.naver.com",
  "ad.daum.net",
  "display.ad.daum.net",
  "wat.ad.daum.net",
  "adfit.kakao.com",
  "kakaoad.kakao.com",
  "mobon.net",
  "mediacategory.com",
  "widerplanet.com",
  "cauly.co.kr",
  "manplus.co.kr",
  "realclick.co.kr",
  "dable.io",
  "tenping.kr",
  "ilikesponsorad.com",
  "adop.cc",
  "ads-partners.coupang.com",
  "buzzvil.com",
  "adpies.com",
  "dawin.tv",
  "smartmediarep.com",
  "mezzo-media.co.kr",
  "adinc.co.kr",
  "criteo.co.kr",
  "tgmark.co.kr",
  "linkprice.com",
  "ilikeclick.com"
];

const BUILTIN_TRACKER_DOMAINS = [
  // Analytics, Telemetry, Heatmaps & Cross-Site Tracking
  "google-analytics.com",
  "googletagmanager.com",
  "analytics.google.com",
  "ssl.google-analytics.com",
  "scorecardresearch.com",
  "quantserve.com",
  "quantcount.com",
  "hotjar.com",
  "hotjar.io",
  "mouseflow.com",
  "fullstory.com",
  "clarity.ms",
  "mixpanel.com",
  "mxpnl.com",
  "segment.io",
  "segment.com",
  "amplitude.com",
  "appsflyer.com",
  "adjust.com",
  "mathtag.com",
  "bluekai.com",
  "krxd.net",
  "demdex.net",
  "omtrdc.net",
  "2o7.net",
  "everesttech.net",
  "crwdcntrl.net",
  "rlcdn.com",
  "tapad.com",
  "exelator.com",
  "eyeota.net",
  "agkn.com",
  "pippio.com",
  "liveintent.com",
  "liadm.com",
  "id5-sync.com",
  "uidapi.com",
  "chartbeat.com",
  "chartbeat.net",
  "parsely.com",
  "permutive.com",
  "moatads.com",
  "doubleverify.com",
  "adsafeprotected.com",
  "iasds01.com",
  "bat.bing.com",
  "ct.pinterest.com",
  "snap.licdn.com",
  "px.ads.linkedin.com",
  "analytics.tiktok.com",
  "ads-twitter.com",
  "analytics.twitter.com",
  "static.ads-twitter.com",
  "tr.snapchat.com",
  "pixel.facebook.com",
  "an.facebook.com",
  "pixel.wp.com",
  "stats.wp.com",
  "crazyegg.com",
  "luckyorange.com",
  "inspectlet.com",
  "logrocket.io",
  "heapanalytics.com",
  "kissmetrics.com",
  "woopra.com",
  "statcounter.com",
  "histats.com",
  "shinystat.com",
  "mc.yandex.ru",
  "hm.baidu.com",
  "cnzz.com",
  "fingerprintjs.io",
  "fpjs.io",
  "onetrust.io",
  "cookielaw.org",

  // Korean Trackers & Behavioral Loggers
  "acecounter.com",
  "logger.co.kr",
  "lcs.naver.com",
  "analytics.ad.daum.net",
  "adbrix.io",
  "wisetracker.co.kr",
  "beusable.net",
  "netinsight.co.kr"
];

const BUILTIN_POPUP_DOMAINS = [
  // Popunders, Malvertising & Cryptojackers
  "popads.net",
  "popcash.net",
  "propellerads.com",
  "onclickads.net",
  "onclkds.com",
  "exoclick.com",
  "exosrv.com",
  "trafficjunky.net",
  "trafficjunky.com",
  "juicyads.com",
  "adcash.com",
  "hilltopads.net",
  "clickadu.com",
  "adsterra.com",
  "adsterratools.com",
  "highperformanceformat.com",
  "profitabledisplaynetwork.com",
  "effectivegatecpm.com",
  "richpush.co",
  "evadav.com",
  "galaksion.com",
  "mondiad.com",
  "rollerads.com",
  "pushground.com",
  "popmyads.com",
  "popunder.net",
  "admaven.com",
  "bidvertiser.com",
  "zeroredirect1.com",
  "coinhive.com",
  "coin-hive.com",
  "crypto-loot.com",
  "cryptoloot.pro",
  "jsecoin.com",
  "webminepool.com",
  "authedmine.com"
];

// Explicit sub-resource path patterns (preserves CDN root domains like pstatic.net / daumcdn.net)
const BUILTIN_URL_PATTERNS = [
  { id: "google-pagead", category: "ad", regex: /\/pagead\/(js\/adsbygoogle|ads|show_ads|lvz|interaction|conversion|aclk)/i },
  { id: "google-gpt", category: "ad", regex: /\/(gpt|pubads_impl|securepubads)\.js(\?|$)/i },
  { id: "naver-tveta", category: "ad", regex: /pstatic\.net\/tveta\//i },
  { id: "kakao-kas", category: "ad", regex: /daumcdn\.net\/kas\//i },
  { id: "fb-pixel", category: "tracker", regex: /connect\.facebook\.net\/[^/]+\/(fbevents|signals)\b/i },
  { id: "snap-pixel", category: "tracker", regex: /sc-static\.net\/scevent\.min\.js/i },
  { id: "yt-ads-stats", category: "ad", regex: /youtube\.com\/(api\/stats\/ads|pagead\/|ptracking|get_midroll_info)/i },
  { id: "yt-ad-break", category: "ad", regex: /youtube\.com\/youtubei\/v1\/player\/ad_break/i },
  { id: "reddit-events", category: "tracker", regex: /redditmedia\.com\/gtm\.js|alb\.reddit\.com\/snoo\.gif/i },
  { id: "yandex-metrika", category: "tracker", regex: /yandex\.ru\/metrika/i },
  { id: "generic-ads-js", category: "ad", regex: /\/(adsbygoogle|show_ads|prebid|adserver|popunder)\.js(\?|$)/i }
];

const AGGRESSIVE_THIRD_PARTY_PATTERNS = [
  { id: "aggressive-ad-path", category: "ad", regex: /\/(adserver|adframe|adbanner|adslot|ad_iframe|popunder|bidder|adclick|adtrack|sponsored_ads)\b/i },
  { id: "aggressive-pixel-path", category: "tracker", regex: /\/(pixel|beacon|track|telemetry|collect)\.(gif|png|js|php)(\?|$)/i }
];

// Never block core authentication, captcha, or local loopback origins as false positives
const CRITICAL_AUTH_ALLOW_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "account.proton.me",
  "mail.proton.me",
  "drive.proton.me",
  "calendar.proton.me",
  "pass.proton.me",
  "accounts.google.com",
  "challenges.cloudflare.com",
  "hcaptcha.com",
  "newassets.hcaptcha.com",
  "recaptcha.net",
  "login.microsoftonline.com",
  "appleid.apple.com",
  "gitlab.com",
  "github.com"
]);

// Known cross-site tracking query parameters safe to strip
const TRACKING_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_name",
  "utm_reader",
  "utm_viz_id",
  "utm_pubreferrer",
  "utm_swu",
  "fbclid",
  "gclid",
  "dclid",
  "gclsrc",
  "msclkid",
  "twclid",
  "ttclid",
  "li_fat_id",
  "mc_eid",
  "mc_cid",
  "igshid",
  "_hsenc",
  "_hsmi",
  "yclid",
  "vero_id",
  "oly_enc_id",
  "oly_anon_id",
  "mkt_tok",
  "wickedid",
  "rb_clickid",
  "s_kwcid",
  "spm"
]);

// Built-in EasyList Cosmetic Selectors to collapse empty ad containers cleanly
const BUILTIN_COSMETIC_SELECTORS = [
  "ins.adsbygoogle",
  ".adsbygoogle",
  "[id^=\"div-gpt-ad\"]",
  "[id^=\"google_ads_iframe\"]",
  "iframe[src*=\"doubleclick.net\"]",
  "iframe[src*=\"googlesyndication.com\"]",
  "iframe[src*=\"adnxs.com\"]",
  "iframe[src*=\"taboola.com\"]",
  "iframe[src*=\"criteo.\"]",
  "iframe[id^=\"google_ads_\"]",
  ".taboola-container",
  "[id^=\"taboola-\"]",
  ".OUTBRAIN",
  "[data-widget-id^=\"AR_\"]",
  "[data-ad-client]",
  "[data-ad-slot]",
  "[data-google-query-id]",
  ".ad-container:has(iframe)",
  ".ad-banner-wrap",
  ".ad-slot-container",
  ".dfp-ad",
  ".gpt-ad",
  ".sponsored-banner",
  // Korean Portal Ad Containers (Naver / Daum / Kakao / News)
  "#veta_top",
  "#veta_branding",
  "#timeboard-ex",
  ".adfit_banner",
  "ins.kakao_ad_area",
  "[id^=\"daumAd\"]",
  "iframe[src*=\"veta.naver.com\"]",
  "iframe[src*=\"ad.daum.net\"]",
  "iframe[src*=\"mobon.net\"]",
  "iframe[src*=\"dable.io\"]",
  ".dable_placeholder",
  "[id^=\"dablewidget_\"]",
  // YouTube Feed & Overlay Ad Containers
  "ytd-ad-slot-renderer",
  "ytd-in-feed-ad-layout-renderer",
  "ytd-banner-promo-renderer",
  "ytd-statement-banner-renderer",
  "ytd-promoted-sparkles-web-renderer",
  "ytd-promoted-video-renderer",
  "ytd-display-ad-renderer",
  "ytd-compact-promoted-video-renderer",
  "ytd-player-legacy-desktop-watch-ads-renderer",
  "ytd-engagement-panel-section-list-renderer[target-id=\"engagement-panel-ads\"]",
  "#masthead-ad",
  "#player-ads",
  ".ytp-ad-overlay-container",
  ".ytp-ad-image-overlay",
  ".ytp-ad-text-overlay",
  ".ytd-merch-shelf-renderer"
];

const DEFAULT_FILTER_SOURCES = [
  {
    id: "pgl-yoyo",
    name: "Peter Lowe's Ad & Tracking Server List",
    url: "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=adblockplus&showintro=0&mimetype=plaintext",
    enabled: true
  },
  {
    id: "adaway-hosts",
    name: "AdAway Official Mobile & Web Ad Hosts",
    url: "https://adaway.org/hosts.txt",
    enabled: true
  }
];

// ============================================================================
// 2. STATE & PERSISTENCE
// ============================================================================

const MULTI_PART_TLDS = new Set([
  "co.kr", "or.kr", "ne.kr", "go.kr", "ac.kr", "pe.kr",
  "co.uk", "org.uk", "ac.uk", "gov.uk",
  "co.jp", "ne.jp", "or.jp",
  "com.au", "net.au", "org.au",
  "com.br", "com.cn", "com.tw", "com.sg", "com.hk"
]);

function getAdblockDataDir() {
  try {
    if (electronApp && typeof electronApp.getPath === "function") {
      const dir = electronApp.getPath("userData");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      return dir;
    }
  } catch {}
  const fallback = path.join(os.homedir(), ".aether");
  if (!fs.existsSync(fallback)) fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

function getConfigPath() {
  return path.join(getAdblockDataDir(), "adblock-config.json");
}

function getListsCachePath() {
  return path.join(getAdblockDataDir(), "adblock-lists.json");
}

const DEFAULT_CONFIG = {
  enabled: true,
  mode: "standard", // "standard" | "aggressive"
  cosmeticFiltering: true,
  stripTrackingParams: true,
  blockPopups: true,
  youtubeAdSkip: true,
  whitelistedDomains: [],
  customRules: [],
  lifetimeAdsBlocked: 0,
  lifetimeTrackersBlocked: 0,
  lifetimePopupsBlocked: 0,
  lifetimeParamsStripped: 0,
  lastUpdatedListsAt: null
};

let config = { ...DEFAULT_CONFIG };
let subscribedDomains = new Set();
let subscribedSourcesMeta = [];

// Compiled runtime lookup structures
let adDomainSet = new Set(BUILTIN_AD_DOMAINS);
let trackerDomainSet = new Set(BUILTIN_TRACKER_DOMAINS);
let popupDomainSet = new Set(BUILTIN_POPUP_DOMAINS);
let customBlockDomains = new Set();
let customAllowDomains = new Set();
let customUrlSubstrings = [];
let customCosmeticGlobal = [];
let customCosmeticByDomain = new Map();
let whitelistSet = new Set();

// Live session telemetry
let sessionStats = {
  adsBlocked: 0,
  trackersBlocked: 0,
  popupsBlocked: 0,
  paramsStripped: 0,
  totalBlocked: 0
};
const tabBlockedCounts = new Map(); // webContentsId -> count
const topBlockedDomains = new Map(); // domain -> count
const recentBlocked = []; // max 60 entries
let blockSeq = 0;

let saveTimer = null;
let broadcastTimer = null;
let initialized = false;
const attachedSessions = new WeakSet();

// ============================================================================
// 3. DOMAIN & FILTER PARSING HELPERS
// ============================================================================

function normalizeHostname(raw) {
  if (!raw || typeof raw !== "string") return "";
  let cleaned = raw.trim().toLowerCase();
  if (!cleaned) return "";
  try {
    if (cleaned.includes("://")) {
      cleaned = new URL(cleaned).hostname.toLowerCase();
    } else {
      cleaned = cleaned.split("/")[0].split(":")[0];
    }
  } catch {
    cleaned = cleaned.split("/")[0].split(":")[0];
  }
  return cleaned.replace(/^\.+|\.+$/g, "").replace(/^www\./, "");
}

function extractExactHost(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return "";
  try {
    return new URL(urlStr).hostname.toLowerCase().replace(/\.+$/, "");
  } catch {
    return "";
  }
}

function getRegistrableDomain(hostname) {
  const host = (hostname || "").toLowerCase().replace(/\.+$/, "");
  if (!host) return "";
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host === "localhost" || host.endsWith(".onion")) {
    return host;
  }
  const parts = host.split(".");
  if (parts.length <= 2) return host;
  const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  if (MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3) {
    return `${parts[parts.length - 3]}.${lastTwo}`;
  }
  return lastTwo;
}

function matchDomainSet(hostname, set) {
  if (!hostname || !set || set.size === 0) return null;
  let cur = hostname.toLowerCase().replace(/\.+$/, "");
  while (cur) {
    if (set.has(cur)) return cur;
    const dot = cur.indexOf(".");
    if (dot === -1) break;
    cur = cur.slice(dot + 1);
  }
  return null;
}

function parseFilterRules(rulesList = []) {
  const blockDomains = new Set();
  const allowDomains = new Set();
  const urlSubstrings = [];
  const cosmeticGlobal = [];
  const cosmeticByDomain = new Map();

  for (const rawLine of rulesList) {
    if (typeof rawLine !== "string") continue;
    const line = rawLine.trim();
    if (!line || line.startsWith("!") || line.startsWith("[") || line.startsWith("# ")) continue;

    // 1. Cosmetic hiding rule: [domains]##selector
    const cosmIdx = line.indexOf("##");
    if (cosmIdx !== -1 && !line.startsWith("@@")) {
      const domainPart = line.slice(0, cosmIdx).trim();
      const selector = line.slice(cosmIdx + 2).trim();
      if (!selector) continue;
      if (!domainPart) {
        cosmeticGlobal.push(selector);
      } else {
        for (const d of domainPart.split(",")) {
          const norm = normalizeHostname(d);
          if (!norm || norm.startsWith("~")) continue;
          if (!cosmeticByDomain.has(norm)) cosmeticByDomain.set(norm, []);
          cosmeticByDomain.get(norm).push(selector);
        }
      }
      continue;
    }

    // 2. Exception rule: @@||domain^
    if (line.startsWith("@@")) {
      let body = line.slice(2).trim();
      if (body.startsWith("||")) body = body.slice(2);
      const host = body.split(/[\^/$*]/)[0].trim().toLowerCase();
      if (host && host.includes(".") && !host.includes(" ")) {
        allowDomains.add(host.replace(/^www\./, ""));
      }
      continue;
    }

    // 3. Hosts file format: 0.0.0.0 domain.com or 127.0.0.1 domain.com
    const hostsMatch = line.match(/^(?:0\.0\.0\.0|127\.0\.0\.1)\s+([a-z0-9.-]+\.[a-z]{2,})(?:\s+#.*)?$/i);
    if (hostsMatch) {
      const host = hostsMatch[1].toLowerCase();
      if (host !== "localhost" && host !== "local" && !host.endsWith(".local")) {
        blockDomains.add(host);
      }
      continue;
    }

    // 4. Adblock Plus / uBlock domain anchor: ||domain.com^ or ||domain.com$third-party
    if (line.startsWith("||")) {
      const withoutPrefix = line.slice(2);
      const [patternPart] = withoutPrefix.split("$");
      // Pure domain rule if it ends with ^ or / or nothing and has no path beyond /
      const pureMatch = patternPart.match(/^([a-z0-9.-]+\.[a-z]{2,})(?:\^|\/)?$/i);
      if (pureMatch) {
        blockDomains.add(pureMatch[1].toLowerCase());
      } else if (patternPart.length >= 5) {
        urlSubstrings.push(patternPart.replace(/\^/g, "").toLowerCase());
      }
      continue;
    }

    // 5. Bare domain (e.g. "ads.example.com")
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(line)) {
      blockDomains.add(line.toLowerCase());
      continue;
    }

    // 6. URL substring rule
    const cleanedPattern = line.split("$")[0].trim();
    if (cleanedPattern.length >= 4 && !cleanedPattern.startsWith("#")) {
      urlSubstrings.push(cleanedPattern.toLowerCase());
    }
  }

  return {
    blockDomains,
    allowDomains,
    urlSubstrings,
    cosmeticGlobal,
    cosmeticByDomain
  };
}

function rebuildCompiledRules() {
  trackerDomainSet = new Set(BUILTIN_TRACKER_DOMAINS);
  popupDomainSet = new Set(BUILTIN_POPUP_DOMAINS);
  adDomainSet = new Set(BUILTIN_AD_DOMAINS);
  for (const d of subscribedDomains) {
    if (!matchDomainSet(d, trackerDomainSet) && !matchDomainSet(d, popupDomainSet)) {
      adDomainSet.add(d);
    }
  }

  whitelistSet = new Set(
    (config.whitelistedDomains || []).map(normalizeHostname).filter(Boolean)
  );

  const parsedCustom = parseFilterRules(config.customRules || []);
  customBlockDomains = parsedCustom.blockDomains;
  customAllowDomains = parsedCustom.allowDomains;
  customUrlSubstrings = parsedCustom.urlSubstrings;
  customCosmeticGlobal = parsedCustom.cosmeticGlobal;
  customCosmeticByDomain = parsedCustom.cosmeticByDomain;
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  try {
    const cfgPath = getConfigPath();
    if (fs.existsSync(cfgPath)) {
      const parsed = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      config = { ...DEFAULT_CONFIG, ...parsed };
      if (!Array.isArray(config.whitelistedDomains)) config.whitelistedDomains = [];
      if (!Array.isArray(config.customRules)) config.customRules = [];
    }
  } catch (e) {
    config = { ...DEFAULT_CONFIG };
  }

  try {
    const listsPath = getListsCachePath();
    if (fs.existsSync(listsPath)) {
      const cached = JSON.parse(fs.readFileSync(listsPath, "utf8"));
      if (Array.isArray(cached.domains)) {
        subscribedDomains = new Set(cached.domains);
      }
      if (Array.isArray(cached.sources)) {
        subscribedSourcesMeta = cached.sources;
      }
    }
  } catch {}

  rebuildCompiledRules();
}

function saveConfigImmediate() {
  try {
    fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), "utf8");
  } catch (e) {
    console.error("[Aetherum Adblock] Failed saving config:", e.message);
  }
}

function saveConfigDebounced() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveConfigImmediate();
  }, 2000);
  if (typeof saveTimer.unref === "function") saveTimer.unref();
}

function broadcastStatsDebounced() {
  if (broadcastTimer) return;
  broadcastTimer = setTimeout(() => {
    broadcastTimer = null;
    if (!electronWebContents) return;
    try {
      const payload = getAdblockStatus();
      for (const wc of electronWebContents.getAllWebContents()) {
        if (!wc.isDestroyed()) {
          wc.send("hyper:adblock:stats-updated", payload);
        }
      }
    } catch {}
  }, 350);
  if (typeof broadcastTimer.unref === "function") broadcastTimer.unref();
}

// ============================================================================
// 4. CORE REQUEST EVALUATION & URL TRACKING PARAMETER CLEANER
// ============================================================================

function isSiteWhitelisted(hostnameOrUrl) {
  ensureInitialized();
  const host = extractExactHost(hostnameOrUrl) || normalizeHostname(hostnameOrUrl);
  if (!host) return false;
  return Boolean(matchDomainSet(host, whitelistSet) || matchDomainSet(host, customAllowDomains));
}

function recordBlockedEvent({ url, domain, initiatorDomain, resourceType, category, matchedRule, webContentsId }) {
  sessionStats.totalBlocked++;
  if (category === "popup") {
    sessionStats.popupsBlocked++;
    config.lifetimePopupsBlocked = (config.lifetimePopupsBlocked || 0) + 1;
  } else if (category === "tracker") {
    sessionStats.trackersBlocked++;
    config.lifetimeTrackersBlocked = (config.lifetimeTrackersBlocked || 0) + 1;
  } else {
    sessionStats.adsBlocked++;
    config.lifetimeAdsBlocked = (config.lifetimeAdsBlocked || 0) + 1;
  }

  if (typeof webContentsId === "number") {
    tabBlockedCounts.set(webContentsId, (tabBlockedCounts.get(webContentsId) || 0) + 1);
  }

  if (domain) {
    topBlockedDomains.set(domain, (topBlockedDomains.get(domain) || 0) + 1);
  }

  blockSeq++;
  recentBlocked.unshift({
    id: blockSeq,
    timestamp: new Date().toISOString(),
    url: String(url || "").slice(0, 240),
    domain: domain || "unknown",
    initiatorDomain: initiatorDomain || "",
    resourceType: resourceType || "other",
    category: category || "ad",
    rule: matchedRule || domain || "pattern"
  });
  if (recentBlocked.length > 60) {
    recentBlocked.length = 60;
  }

  saveConfigDebounced();
  broadcastStatsDebounced();
}

function evaluateRequest(details = {}, options = { record: true }) {
  ensureInitialized();
  if (!config.enabled) {
    return { cancel: false, reason: "disabled" };
  }

  const rawUrl = String(details.url || "");
  if (!rawUrl) return { cancel: false };

  // Only inspect http/https/ws/wss traffic
  if (!/^(https?|wss?):\/\//i.test(rawUrl)) {
    return { cancel: false };
  }

  const host = extractExactHost(rawUrl);
  if (!host) return { cancel: false };

  // Never block loopback or critical auth/captcha challenges
  if (CRITICAL_AUTH_ALLOW_HOSTS.has(host) || host.endsWith(".proton.me") || host.endsWith(".protonmail.com")) {
    return { cancel: false, reason: "critical-allow" };
  }

  const initiatorRaw = details.initiator || details.referrer || details.documentUrl || "";
  const initiatorHost = extractExactHost(initiatorRaw);
  const resourceType = details.resourceType || "other";

  // Respect per-site user whitelist & @@||exception^ rules
  if (initiatorHost && (matchDomainSet(initiatorHost, whitelistSet) || matchDomainSet(initiatorHost, customAllowDomains))) {
    return { cancel: false, reason: "site-whitelisted" };
  }
  if (matchDomainSet(host, whitelistSet) || matchDomainSet(host, customAllowDomains)) {
    return { cancel: false, reason: "target-whitelisted" };
  }

  // Main frame navigations: only block known malvertising/popup domains or explicit custom domain rules
  if (resourceType === "mainFrame") {
    const customHit = matchDomainSet(host, customBlockDomains);
    if (customHit) {
      if (options.record) {
        recordBlockedEvent({
          url: rawUrl,
          domain: host,
          initiatorDomain: initiatorHost,
          resourceType,
          category: "ad",
          matchedRule: `||${customHit}^`,
          webContentsId: details.webContentsId
        });
      }
      return { cancel: true, category: "ad", matchedRule: `||${customHit}^`, domain: host };
    }

    if (config.blockPopups) {
      const popupHit = matchDomainSet(host, popupDomainSet);
      if (popupHit) {
        if (options.record) {
          recordBlockedEvent({
            url: rawUrl,
            domain: host,
            initiatorDomain: initiatorHost,
            resourceType,
            category: "popup",
            matchedRule: `||${popupHit}^`,
            webContentsId: details.webContentsId
          });
        }
        return { cancel: true, category: "popup", matchedRule: `||${popupHit}^`, domain: host };
      }
    }
    return { cancel: false };
  }

  // Block HTML5 <a ping> hyperlink auditing beacons
  if (resourceType === "ping") {
    if (options.record) {
      recordBlockedEvent({
        url: rawUrl,
        domain: host,
        initiatorDomain: initiatorHost,
        resourceType,
        category: "tracker",
        matchedRule: "ping-beacon",
        webContentsId: details.webContentsId
      });
    }
    return { cancel: true, category: "tracker", matchedRule: "ping-beacon", domain: host };
  }

  // 1. Custom domain rules
  const customDomainHit = matchDomainSet(host, customBlockDomains);
  if (customDomainHit) {
    if (options.record) {
      recordBlockedEvent({
        url: rawUrl,
        domain: host,
        initiatorDomain: initiatorHost,
        resourceType,
        category: "ad",
        matchedRule: `||${customDomainHit}^`,
        webContentsId: details.webContentsId
      });
    }
    return { cancel: true, category: "ad", matchedRule: `||${customDomainHit}^`, domain: host };
  }

  // 2. Popup & Malvertising domains
  const popupDomainHit = matchDomainSet(host, popupDomainSet);
  if (popupDomainHit) {
    if (options.record) {
      recordBlockedEvent({
        url: rawUrl,
        domain: host,
        initiatorDomain: initiatorHost,
        resourceType,
        category: "popup",
        matchedRule: `||${popupDomainHit}^`,
        webContentsId: details.webContentsId
      });
    }
    return { cancel: true, category: "popup", matchedRule: `||${popupDomainHit}^`, domain: host };
  }

  // 3. Ad Network & Subscribed Blocklist domains
  const adDomainHit = matchDomainSet(host, adDomainSet);
  if (adDomainHit) {
    if (options.record) {
      recordBlockedEvent({
        url: rawUrl,
        domain: host,
        initiatorDomain: initiatorHost,
        resourceType,
        category: "ad",
        matchedRule: `||${adDomainHit}^`,
        webContentsId: details.webContentsId
      });
    }
    return { cancel: true, category: "ad", matchedRule: `||${adDomainHit}^`, domain: host };
  }

  // 4. Tracker, Analytics & Fingerprinting domains
  const trackerDomainHit = matchDomainSet(host, trackerDomainSet);
  if (trackerDomainHit) {
    if (options.record) {
      recordBlockedEvent({
        url: rawUrl,
        domain: host,
        initiatorDomain: initiatorHost,
        resourceType,
        category: "tracker",
        matchedRule: `||${trackerDomainHit}^`,
        webContentsId: details.webContentsId
      });
    }
    return { cancel: true, category: "tracker", matchedRule: `||${trackerDomainHit}^`, domain: host };
  }

  // 5. Built-in URL path patterns
  for (const rule of BUILTIN_URL_PATTERNS) {
    if (rule.regex.test(rawUrl)) {
      if (options.record) {
        recordBlockedEvent({
          url: rawUrl,
          domain: host,
          initiatorDomain: initiatorHost,
          resourceType,
          category: rule.category,
          matchedRule: rule.id,
          webContentsId: details.webContentsId
        });
      }
      return { cancel: true, category: rule.category, matchedRule: rule.id, domain: host };
    }
  }

  // 6. Custom URL substring rules
  if (customUrlSubstrings.length > 0) {
    const lowerUrl = rawUrl.toLowerCase();
    for (const sub of customUrlSubstrings) {
      if (lowerUrl.includes(sub)) {
        if (options.record) {
          recordBlockedEvent({
            url: rawUrl,
            domain: host,
            initiatorDomain: initiatorHost,
            resourceType,
            category: "ad",
            matchedRule: sub,
            webContentsId: details.webContentsId
          });
        }
        return { cancel: true, category: "ad", matchedRule: sub, domain: host };
      }
    }
  }

  // 7. Aggressive 3rd-party heuristics
  if (config.mode === "aggressive" && initiatorHost) {
    const isThirdParty = getRegistrableDomain(host) !== getRegistrableDomain(initiatorHost);
    if (isThirdParty) {
      for (const rule of AGGRESSIVE_THIRD_PARTY_PATTERNS) {
        if (rule.regex.test(rawUrl)) {
          if (options.record) {
            recordBlockedEvent({
              url: rawUrl,
              domain: host,
              initiatorDomain: initiatorHost,
              resourceType,
              category: rule.category,
              matchedRule: rule.id,
              webContentsId: details.webContentsId
            });
          }
          return { cancel: true, category: rule.category, matchedRule: rule.id, domain: host };
        }
      }
    }
  }

  return { cancel: false };
}

function shouldBlockPopup(targetUrl, openerUrl = "") {
  ensureInitialized();
  if (!config.enabled || !config.blockPopups) return false;
  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) return false;

  const openerHost = extractExactHost(openerUrl);
  if (openerHost && isSiteWhitelisted(openerHost)) return false;

  const host = extractExactHost(targetUrl);
  if (!host) return false;
  if (CRITICAL_AUTH_ALLOW_HOSTS.has(host)) return false;

  const popupHit =
    matchDomainSet(host, popupDomainSet) ||
    matchDomainSet(host, adDomainSet) ||
    matchDomainSet(host, customBlockDomains);

  if (popupHit) {
    recordBlockedEvent({
      url: targetUrl,
      domain: host,
      initiatorDomain: openerHost,
      resourceType: "popup",
      category: "popup",
      matchedRule: `popup:||${popupHit}^`
    });
    return true;
  }

  for (const rule of BUILTIN_URL_PATTERNS) {
    if (rule.category === "ad" && rule.regex.test(targetUrl)) {
      recordBlockedEvent({
        url: targetUrl,
        domain: host,
        initiatorDomain: openerHost,
        resourceType: "popup",
        category: "popup",
        matchedRule: `popup:${rule.id}`
      });
      return true;
    }
  }

  return false;
}

function cleanTrackingUrl(rawUrl, record = true) {
  ensureInitialized();
  if (!rawUrl || typeof rawUrl !== "string") {
    return { cleanedUrl: rawUrl, removedCount: 0, removedParams: [] };
  }
  if (!config.enabled || !config.stripTrackingParams) {
    return { cleanedUrl: rawUrl, removedCount: 0, removedParams: [] };
  }
  if (!/^https?:\/\//i.test(rawUrl)) {
    return { cleanedUrl: rawUrl, removedCount: 0, removedParams: [] };
  }

  try {
    const parsed = new URL(rawUrl);
    if (isSiteWhitelisted(parsed.hostname)) {
      return { cleanedUrl: rawUrl, removedCount: 0, removedParams: [] };
    }

    const removedParams = [];
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (TRACKING_QUERY_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
        removedParams.push(key);
      }
    }

    if (removedParams.length > 0) {
      if (record) {
        sessionStats.paramsStripped += removedParams.length;
        config.lifetimeParamsStripped = (config.lifetimeParamsStripped || 0) + removedParams.length;
        saveConfigDebounced();
        broadcastStatsDebounced();
      }
      return {
        cleanedUrl: parsed.toString(),
        removedCount: removedParams.length,
        removedParams
      };
    }
  } catch {}

  return { cleanedUrl: rawUrl, removedCount: 0, removedParams: [] };
}

// ============================================================================
// 5. COSMETIC CSS & DOM / YOUTUBE AD DEFUSER PAYLOAD
// ============================================================================

function getCosmeticPayload(pageUrl = "") {
  ensureInitialized();
  const host = extractExactHost(pageUrl);
  if (
    !config.enabled ||
    !pageUrl ||
    !/^https?:\/\//i.test(pageUrl) ||
    CRITICAL_AUTH_ALLOW_HOSTS.has(host) ||
    isSiteWhitelisted(host)
  ) {
    return { enabled: false, css: "", script: "" };
  }

  let css = "";
  if (config.cosmeticFiltering) {
    const selectors = [...BUILTIN_COSMETIC_SELECTORS, ...customCosmeticGlobal];
    if (host && customCosmeticByDomain.size > 0) {
      for (const [domainKey, domSelectors] of customCosmeticByDomain.entries()) {
        if (host === domainKey || host.endsWith(`.${domainKey}`)) {
          selectors.push(...domSelectors);
        }
      }
    }
    css = `${selectors.join(",\n")} {\n  display: none !important;\n  visibility: hidden !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  pointer-events: none !important;\n}\n`;
  }

  const isYouTube = host === "youtube.com" || host.endsWith(".youtube.com");
  const scriptParts = [];

  if (config.stripTrackingParams) {
    const paramsJson = JSON.stringify(Array.from(TRACKING_QUERY_PARAMS));
    scriptParts.push(`
      try {
        const u = new URL(window.location.href);
        const stripSet = new Set(${paramsJson});
        let changed = false;
        for (const k of Array.from(u.searchParams.keys())) {
          if (stripSet.has(k.toLowerCase())) {
            u.searchParams.delete(k);
            changed = true;
          }
        }
        if (changed && window.history && typeof window.history.replaceState === "function") {
          window.history.replaceState(window.history.state, "", u.toString());
        }
      } catch (_) {}
    `);
  }

  if (isYouTube && config.youtubeAdSkip) {
    scriptParts.push(`
      try {
        if (!window.__aetherumYtShieldInstalled) {
          window.__aetherumYtShieldInstalled = true;
          const sweepYtAds = () => {
            const skipBtns = document.querySelectorAll(".ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button");
            skipBtns.forEach((btn) => { try { btn.click(); } catch (_) {} });
            const player = document.querySelector(".html5-video-player.ad-showing");
            if (player) {
              const vid = player.querySelector("video");
              if (vid) {
                vid.muted = true;
                if (Number.isFinite(vid.duration) && vid.duration > 0.5 && vid.currentTime < vid.duration - 0.1) {
                  vid.currentTime = vid.duration;
                }
              }
            }
          };
          sweepYtAds();
          const obs = new MutationObserver(sweepYtAds);
          obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
        }
      } catch (_) {}
    `);
  }

  const script = scriptParts.length > 0 ? `(function(){${scriptParts.join("\n")}})();` : "";
  return { enabled: true, css, script };
}

// ============================================================================
// 6. REMOTE COMMUNITY FILTER LIST UPDATER
// ============================================================================

function fetchTextUrl(urlStr, timeoutMs = 15000, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 4) return reject(new Error("Too many redirects"));
    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.get(
        parsed,
        {
          headers: {
            "User-Agent": "Aetherum-Adblock/0.0.1 (Aether Privacy Platform)",
            "Accept": "text/plain,*/*"
          },
          timeout: timeoutMs
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            const nextUrl = new URL(res.headers.location, parsed).toString();
            return fetchTextUrl(nextUrl, timeoutMs, redirects + 1).then(resolve, reject);
          }
          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          const chunks = [];
          let totalBytes = 0;
          const MAX_BYTES = 8 * 1024 * 1024;
          res.on("data", (chunk) => {
            totalBytes += chunk.length;
            if (totalBytes <= MAX_BYTES) chunks.push(chunk);
          });
          res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        }
      );
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Filter download timed out"));
      });
      req.on("error", reject);
    } catch (e) {
      reject(e);
    }
  });
}

async function updateFilterLists(customSources = null) {
  ensureInitialized();
  const sources = Array.isArray(customSources) && customSources.length > 0 ? customSources : DEFAULT_FILTER_SOURCES;
  const aggregatedDomains = new Set();
  const sourceResults = [];

  for (const src of sources) {
    if (!src.enabled || !src.url) continue;
    try {
      const text = await fetchTextUrl(src.url, 15000);
      const lines = text.split(/\r?\n/);
      const parsed = parseFilterRules(lines);
      for (const d of parsed.blockDomains) {
        if (!CRITICAL_AUTH_ALLOW_HOSTS.has(d)) {
          aggregatedDomains.add(d);
        }
      }
      sourceResults.push({
        id: src.id,
        name: src.name,
        url: src.url,
        ok: true,
        ruleCount: parsed.blockDomains.size,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      sourceResults.push({
        id: src.id,
        name: src.name,
        url: src.url,
        ok: false,
        error: err.message
      });
    }
  }

  if (aggregatedDomains.size > 0) {
    subscribedDomains = aggregatedDomains;
    subscribedSourcesMeta = sourceResults;
    config.lastUpdatedListsAt = new Date().toISOString();
    try {
      fs.writeFileSync(
        getListsCachePath(),
        JSON.stringify(
          {
            updatedAt: config.lastUpdatedListsAt,
            sources: sourceResults,
            domains: Array.from(subscribedDomains)
          },
          null,
          2
        ),
        "utf8"
      );
    } catch (e) {
      console.error("[Aetherum Adblock] Failed caching filter lists:", e.message);
    }
    saveConfigImmediate();
    rebuildCompiledRules();
    broadcastStatsDebounced();
  }

  return {
    ok: aggregatedDomains.size > 0 || sourceResults.every((s) => s.ok),
    importedDomainsCount: subscribedDomains.size,
    sources: sourceResults,
    status: getAdblockStatus()
  };
}

// ============================================================================
// 7. CONFIGURATION MUTATORS & STATUS SNAPSHOT
// ============================================================================

function getAdblockStatus(currentUrl = "") {
  ensureInitialized();
  const currentHost = normalizeHostname(currentUrl);
  const siteWhitelisted = currentHost ? isSiteWhitelisted(currentHost) : false;

  const topDomains = Array.from(topBlockedDomains.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([domain, count]) => ({ domain, count }));

  const totalActiveRules =
    adDomainSet.size +
    trackerDomainSet.size +
    popupDomainSet.size +
    customBlockDomains.size +
    BUILTIN_URL_PATTERNS.length +
    BUILTIN_COSMETIC_SELECTORS.length +
    customCosmeticGlobal.length +
    customUrlSubstrings.length;

  return {
    enabled: Boolean(config.enabled),
    mode: config.mode || "standard",
    cosmeticFiltering: Boolean(config.cosmeticFiltering),
    stripTrackingParams: Boolean(config.stripTrackingParams),
    blockPopups: Boolean(config.blockPopups),
    youtubeAdSkip: Boolean(config.youtubeAdSkip),
    whitelistedDomains: [...(config.whitelistedDomains || [])],
    customRules: [...(config.customRules || [])],
    currentHost,
    siteWhitelisted,
    stats: {
      sessionAdsBlocked: sessionStats.adsBlocked,
      sessionTrackersBlocked: sessionStats.trackersBlocked,
      sessionPopupsBlocked: sessionStats.popupsBlocked,
      sessionParamsStripped: sessionStats.paramsStripped,
      sessionTotalBlocked: sessionStats.totalBlocked,
      lifetimeAdsBlocked: config.lifetimeAdsBlocked || 0,
      lifetimeTrackersBlocked: config.lifetimeTrackersBlocked || 0,
      lifetimePopupsBlocked: config.lifetimePopupsBlocked || 0,
      lifetimeParamsStripped: config.lifetimeParamsStripped || 0,
      lifetimeTotalBlocked:
        (config.lifetimeAdsBlocked || 0) +
        (config.lifetimeTrackersBlocked || 0) +
        (config.lifetimePopupsBlocked || 0)
    },
    rulesSummary: {
      builtinAdDomains: BUILTIN_AD_DOMAINS.length,
      builtinTrackerDomains: BUILTIN_TRACKER_DOMAINS.length,
      builtinPopupDomains: BUILTIN_POPUP_DOMAINS.length,
      subscribedDomains: subscribedDomains.size,
      cosmeticSelectors: BUILTIN_COSMETIC_SELECTORS.length + customCosmeticGlobal.length,
      customRulesCount: (config.customRules || []).length,
      totalActiveRules
    },
    filterSources: subscribedSourcesMeta.length > 0 ? subscribedSourcesMeta : DEFAULT_FILTER_SOURCES,
    lastUpdatedListsAt: config.lastUpdatedListsAt,
    topDomains,
    recentBlocked: recentBlocked.slice(0, 35)
  };
}

function setAdblockEnabled(enabled) {
  ensureInitialized();
  config.enabled = Boolean(enabled);
  saveConfigImmediate();
  broadcastStatsDebounced();
  return getAdblockStatus();
}

function toggleAdblock() {
  ensureInitialized();
  return setAdblockEnabled(!config.enabled);
}

function updateAdblockConfig(partial = {}) {
  ensureInitialized();
  if (typeof partial.enabled === "boolean") config.enabled = partial.enabled;
  if (partial.mode === "standard" || partial.mode === "aggressive") config.mode = partial.mode;
  if (typeof partial.cosmeticFiltering === "boolean") config.cosmeticFiltering = partial.cosmeticFiltering;
  if (typeof partial.stripTrackingParams === "boolean") config.stripTrackingParams = partial.stripTrackingParams;
  if (typeof partial.blockPopups === "boolean") config.blockPopups = partial.blockPopups;
  if (typeof partial.youtubeAdSkip === "boolean") config.youtubeAdSkip = partial.youtubeAdSkip;
  if (Array.isArray(partial.whitelistedDomains)) {
    config.whitelistedDomains = Array.from(
      new Set(partial.whitelistedDomains.map(normalizeHostname).filter(Boolean))
    );
  }
  if (Array.isArray(partial.customRules)) {
    config.customRules = partial.customRules
      .map((r) => String(r || "").trim())
      .filter(Boolean);
  }
  rebuildCompiledRules();
  saveConfigImmediate();
  broadcastStatsDebounced();
  return getAdblockStatus();
}

function toggleSiteWhitelist(domainOrUrl, forceState = undefined) {
  ensureInitialized();
  const norm = normalizeHostname(domainOrUrl);
  if (!norm) return getAdblockStatus();

  const currentList = new Set((config.whitelistedDomains || []).map(normalizeHostname).filter(Boolean));
  const currentlyWhitelisted = Boolean(matchDomainSet(norm, currentList));
  const shouldWhitelist = typeof forceState === "boolean" ? forceState : !currentlyWhitelisted;

  if (shouldWhitelist) {
    currentList.add(norm);
  } else {
    currentList.delete(norm);
    // Also remove parent domain if exact subdomain matched a parent entry
    let cur = norm;
    while (cur) {
      currentList.delete(cur);
      const dot = cur.indexOf(".");
      if (dot === -1) break;
      cur = cur.slice(dot + 1);
    }
  }

  config.whitelistedDomains = Array.from(currentList);
  rebuildCompiledRules();
  saveConfigImmediate();
  broadcastStatsDebounced();
  return getAdblockStatus(norm);
}

function addCustomRule(ruleStr) {
  ensureInitialized();
  const rule = String(ruleStr || "").trim();
  if (!rule) return getAdblockStatus();
  if (!config.customRules.includes(rule)) {
    config.customRules.push(rule);
    rebuildCompiledRules();
    saveConfigImmediate();
    broadcastStatsDebounced();
  }
  return getAdblockStatus();
}

function removeCustomRule(ruleStr) {
  ensureInitialized();
  const target = String(ruleStr || "").trim();
  config.customRules = (config.customRules || []).filter((r) => r !== target);
  rebuildCompiledRules();
  saveConfigImmediate();
  broadcastStatsDebounced();
  return getAdblockStatus();
}

function resetAdblockStats(includeLifetime = false) {
  ensureInitialized();
  sessionStats = {
    adsBlocked: 0,
    trackersBlocked: 0,
    popupsBlocked: 0,
    paramsStripped: 0,
    totalBlocked: 0
  };
  tabBlockedCounts.clear();
  topBlockedDomains.clear();
  recentBlocked.length = 0;

  if (includeLifetime) {
    config.lifetimeAdsBlocked = 0;
    config.lifetimeTrackersBlocked = 0;
    config.lifetimePopupsBlocked = 0;
    config.lifetimeParamsStripped = 0;
    saveConfigImmediate();
  }
  broadcastStatsDebounced();
  return getAdblockStatus();
}

// ============================================================================
// 8. ELECTRON SESSION & IPC REGISTRATION
// ============================================================================

function attachAdblockToSession(ses) {
  if (!ses || !ses.webRequest || attachedSessions.has(ses)) return;
  ensureInitialized();
  attachedSessions.add(ses);

  // Auto-seed community filter lists in background on first browser launch
  if (subscribedDomains.size === 0 && !config.lastUpdatedListsAt) {
    const seedTimer = setTimeout(() => {
      updateFilterLists().catch(() => {});
    }, 2500);
    if (typeof seedTimer.unref === "function") seedTimer.unref();
  }

  ses.webRequest.onBeforeRequest((details, callback) => {
    try {
      const verdict = evaluateRequest(details, { record: true });
      if (verdict.cancel) {
        return callback({ cancel: true });
      }
    } catch (e) {
      // Fail-open so a malformed URL never hangs browser navigation
    }
    callback({ cancel: false });
  });
}

function registerAdblockIpc(ipcMain) {
  if (!ipcMain) return;
  ensureInitialized();

  ipcMain.handle("hyper:adblock:status", (_event, currentUrl) => {
    return getAdblockStatus(currentUrl || "");
  });

  ipcMain.handle("hyper:adblock:toggle", () => {
    return toggleAdblock();
  });

  ipcMain.handle("hyper:adblock:set-enabled", (_event, enabled) => {
    return setAdblockEnabled(enabled);
  });

  ipcMain.handle("hyper:adblock:set-config", (_event, partial) => {
    return updateAdblockConfig(partial || {});
  });

  ipcMain.handle("hyper:adblock:toggle-site", (_event, payload) => {
    if (typeof payload === "string") {
      return toggleSiteWhitelist(payload);
    }
    return toggleSiteWhitelist(payload?.domain || payload?.url || "", payload?.whitelisted);
  });

  ipcMain.handle("hyper:adblock:add-rule", (_event, rule) => {
    return addCustomRule(rule);
  });

  ipcMain.handle("hyper:adblock:remove-rule", (_event, rule) => {
    return removeCustomRule(rule);
  });

  ipcMain.handle("hyper:adblock:update-lists", async () => {
    return await updateFilterLists();
  });

  ipcMain.handle("hyper:adblock:reset-stats", (_event, includeLifetime) => {
    return resetAdblockStats(Boolean(includeLifetime));
  });

  ipcMain.handle("hyper:adblock:clean-url", (_event, rawUrl) => {
    return cleanTrackingUrl(rawUrl, true);
  });

  ipcMain.handle("hyper:adblock:cosmetic", (_event, pageUrl) => {
    return getCosmeticPayload(pageUrl || "");
  });

  ipcMain.handle("hyper:adblock:check-url", (_event, payload) => {
    const url = typeof payload === "string" ? payload : payload?.url || "";
    const initiator = typeof payload === "object" ? payload?.initiator || "" : "";
    const resourceType = typeof payload === "object" ? payload?.resourceType || "script" : "script";
    return evaluateRequest({ url, initiator, resourceType }, { record: false });
  });
}

module.exports = {
  BUILTIN_AD_DOMAINS,
  BUILTIN_TRACKER_DOMAINS,
  BUILTIN_POPUP_DOMAINS,
  BUILTIN_COSMETIC_SELECTORS,
  TRACKING_QUERY_PARAMS,
  normalizeHostname,
  getRegistrableDomain,
  matchDomainSet,
  parseFilterRules,
  evaluateRequest,
  shouldBlockPopup,
  cleanTrackingUrl,
  getCosmeticPayload,
  updateFilterLists,
  getAdblockStatus,
  setAdblockEnabled,
  toggleAdblock,
  updateAdblockConfig,
  toggleSiteWhitelist,
  addCustomRule,
  removeCustomRule,
  resetAdblockStats,
  isSiteWhitelisted,
  attachAdblockToSession,
  registerAdblockIpc
};
