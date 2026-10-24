import { h as htmlLang } from "./index-DMHLWY5B.js";
function formatBytes(bytes, lang) {
  const locale = htmlLang(lang);
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "megabyte",
      maximumFractionDigits: 1
    }).format(mb);
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "kilobyte",
    maximumFractionDigits: bytes < 10 * 1024 ? 1 : 0
  }).format(Math.max(bytes / 1024, bytes > 0 ? 0.1 : 0));
}
export {
  formatBytes as f
};
