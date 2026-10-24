import { r as reactExports, h as htmlLang, a as htmlDir, j as jsxRuntimeExports, b as clientExports, R as React } from "./index-DMHLWY5B.js";
import { Q as QuickLookView } from "./QuickLookView-BH3GaRkC.js";
function QuickLookWindow({
  initialLang,
  initialPayload
}) {
  const [lang, setLang] = reactExports.useState(initialLang);
  const [payload, setPayload] = reactExports.useState(initialPayload);
  const [closing, setClosing] = reactExports.useState(false);
  const [openCycle, setOpenCycle] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const api2 = window.aiOfficeQuickLook;
    if (!api2) return;
    const offUpdate = api2.onUpdate((next) => setPayload(next));
    const offWillShow = api2.onWillShow(() => {
      setClosing(false);
      setOpenCycle((n) => n + 1);
    });
    const offWillHide = api2.onWillHide(() => {
      setClosing(true);
    });
    const offLang = api2.onLangChanged((nextLang) => {
      setLang(nextLang);
      document.documentElement.lang = htmlLang(nextLang);
      document.documentElement.dir = htmlDir(nextLang);
    });
    return () => {
      offUpdate();
      offWillShow();
      offWillHide();
      offLang();
    };
  }, []);
  reactExports.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        setClosing(true);
        void window.aiOfficeQuickLook?.close();
      } else if (e.key === "Enter") {
        e.preventDefault();
        setClosing(true);
        void window.aiOfficeQuickLook?.openInEditor();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    QuickLookView,
    {
      lang,
      payload,
      standalone: true,
      closing,
      onOpenInEditor: () => {
        setClosing(true);
        void window.aiOfficeQuickLook?.openInEditor();
      },
      onRevealInFolder: () => {
        void window.aiOfficeQuickLook?.revealInFolder();
      },
      onClose: () => {
        setClosing(true);
        void window.aiOfficeQuickLook?.close();
      }
    },
    openCycle
  );
}
function applyTheme(theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}
const api = window.aiOfficeQuickLook;
if (api) {
  void api.getInit().then(({ lang, theme, payload }) => {
    applyTheme(theme);
    api.onThemeChanged(applyTheme);
    document.documentElement.lang = htmlLang(lang);
    document.documentElement.dir = htmlDir(lang);
    clientExports.createRoot(document.getElementById("root")).render(
      /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(QuickLookWindow, { initialLang: lang, initialPayload: payload }) })
    );
  });
}
