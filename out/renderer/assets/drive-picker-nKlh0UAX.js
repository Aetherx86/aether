import { r as reactExports, j as jsxRuntimeExports, h as htmlLang, a as htmlDir, b as clientExports, R as React } from "./index-DMHLWY5B.js";
import { D as DriveBrowser, d as driveUiText, a as DRIVE_ERROR_KEYS } from "./DriveBrowser-CHUGO7Un.js";
function DrivePickerWindow({ lang, api: api2 }) {
  const t = (key, params) => driveUiText(lang, key, params);
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Map());
  const [working, setWorking] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const list = reactExports.useCallback(
    (listing, pageToken) => api2.list(listing, pageToken),
    [api2]
  );
  const toggle = (entry) => setSelected((prev) => {
    const next = new Map(prev);
    if (next.has(entry.id)) next.delete(entry.id);
    else next.set(entry.id, entry);
    return next;
  });
  const attach = async () => {
    setWorking(true);
    setError(null);
    const picks = [...selected.values()].map((e) => ({ id: e.id, folder: e.type === "folder" }));
    const result = await api2.choose(picks).catch(() => null);
    if (!result || !result.ok) {
      setWorking(false);
      setError(DRIVE_ERROR_KEYS[result?.kind ?? "network"]);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dp", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dp-body", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DriveBrowser,
      {
        lang,
        dateLocale: document.documentElement.lang,
        list,
        pick: { selected, toggle },
        disabled: working
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dp-foot", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dp-count", children: working ? t("drivePickWorking") : error ? t(error) : t("drivePickSelected", { n: String(selected.size) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "drive-ghost", onClick: () => void api2.cancel(), disabled: working, children: t("driveCancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "drive-primary",
          onClick: () => void attach(),
          disabled: working || selected.size === 0,
          children: t("drivePickAttach")
        }
      )
    ] })
  ] });
}
function applyTheme(theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}
const api = window.aiOfficeDrivePicker;
void api.getInit().then(({ lang, theme }) => {
  applyTheme(theme);
  api.onThemeChanged(applyTheme);
  document.documentElement.lang = htmlLang(lang);
  document.documentElement.dir = htmlDir(lang);
  clientExports.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DrivePickerWindow, { lang, api }) })
  );
});
