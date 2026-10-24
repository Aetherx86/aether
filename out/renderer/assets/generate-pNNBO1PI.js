import { r as reactExports, h as htmlLang, a as htmlDir, j as jsxRuntimeExports, b as clientExports, R as React } from "./index-DMHLWY5B.js";
import { g as generateText } from "./strings-generate-7t91CmZC.js";
import { f as formatBytes } from "./format-C7PXsKRr.js";
const AI_TARGET_KINDS = ["slides", "html", "mindmap"];
const DEFAULT_GENERATE_PROMPTS = {
  zh: {
    slides: "请根据附件资料制作一份演示文稿。整理出要点，做成标题清晰的幻灯片。",
    html: "请根据附件资料制作一个网页（HTML）。把要点排得清楚易读。",
    mindmap: "请根据附件资料制作一张思维导图。把主题放在中心，用分支整理要点。"
  },
  en: {
    slides: "Make a presentation from the attached material. Organize the main points into slides with clear titles.",
    html: "Make a web page (HTML) from the attached material. Lay out the main points so they are easy to read.",
    mindmap: "Make a mind map from the attached material. Put the main topic in the center and organize the key points as branches."
  },
  ja: {
    slides: "添付した資料からプレゼンテーションを作成してください。要点を整理し、タイトルの明確なスライドにまとめてください。",
    html: "添付した資料からウェブページ（HTML）を作成してください。要点を読みやすく配置してください。",
    mindmap: "添付した資料からマインドマップを作成してください。中心にテーマを置き、要点を枝として整理してください。"
  },
  ko: {
    slides: "첨부한 자료로 발표 자료를 만들어 주세요. 핵심 내용을 정리해 제목이 분명한 슬라이드로 구성해 주세요.",
    html: "첨부한 자료로 웹 페이지(HTML)를 만들어 주세요. 핵심 내용을 읽기 쉽게 배치해 주세요.",
    mindmap: "첨부한 자료로 마인드맵을 만들어 주세요. 중심 주제를 가운데에 두고 핵심 내용을 가지로 정리해 주세요."
  },
  fr: {
    slides: "Crée une présentation à partir des documents joints. Organise les points principaux en diapositives aux titres clairs.",
    html: "Crée une page web (HTML) à partir des documents joints. Dispose les points principaux pour qu’ils soient faciles à lire.",
    mindmap: "Crée une carte mentale à partir des documents joints. Place le sujet principal au centre et organise les points clés en branches."
  },
  de: {
    slides: "Erstelle aus dem angehängten Material eine Präsentation. Gliedere die wichtigsten Punkte in Folien mit klaren Titeln.",
    html: "Erstelle aus dem angehängten Material eine Webseite (HTML). Ordne die wichtigsten Punkte gut lesbar an.",
    mindmap: "Erstelle aus dem angehängten Material eine Mindmap. Setze das Hauptthema in die Mitte und ordne die wichtigsten Punkte als Zweige an."
  },
  es: {
    slides: "Crea una presentación a partir del material adjunto. Organiza los puntos principales en diapositivas con títulos claros.",
    html: "Crea una página web (HTML) a partir del material adjunto. Distribuye los puntos principales para que sean fáciles de leer.",
    mindmap: "Crea un mapa mental a partir del material adjunto. Pon el tema principal en el centro y organiza los puntos clave como ramas."
  },
  th: {
    slides: "ช่วยสร้างงานนำเสนอจากเอกสารที่แนบมา จัดประเด็นสำคัญเป็นสไลด์ที่มีหัวข้อชัดเจน",
    html: "ช่วยสร้างหน้าเว็บ (HTML) จากเอกสารที่แนบมา จัดวางประเด็นสำคัญให้อ่านง่าย",
    mindmap: "ช่วยสร้างแผนผังความคิดจากเอกสารที่แนบมา วางหัวข้อหลักไว้ตรงกลางและจัดประเด็นสำคัญเป็นกิ่ง"
  },
  id: {
    slides: "Buat presentasi dari materi terlampir. Susun poin-poin utama menjadi slide dengan judul yang jelas.",
    html: "Buat halaman web (HTML) dari materi terlampir. Tata poin-poin utama agar mudah dibaca.",
    mindmap: "Buat peta pikiran dari materi terlampir. Letakkan topik utama di tengah dan susun poin-poin penting sebagai cabang."
  },
  ru: {
    slides: "Сделай презентацию по приложенным материалам. Разложи главные мысли по слайдам с понятными заголовками.",
    html: "Сделай веб-страницу (HTML) по приложенным материалам. Расположи главные мысли так, чтобы их было легко читать.",
    mindmap: "Сделай интеллект-карту по приложенным материалам. Помести главную тему в центр, а ключевые мысли оформи ветвями."
  },
  ar: {
    slides: "أنشئ عرضًا تقديميًا من المواد المرفقة. نظّم النقاط الرئيسية في شرائح ذات عناوين واضحة.",
    html: "أنشئ صفحة ويب (HTML) من المواد المرفقة. رتّب النقاط الرئيسية بحيث تسهل قراءتها.",
    mindmap: "أنشئ خريطة ذهنية من المواد المرفقة. ضع الموضوع الرئيسي في المركز ونظّم النقاط الأساسية في فروع."
  },
  pt: {
    slides: "Crie uma apresentação a partir do material anexado. Organize os pontos principais em slides com títulos claros.",
    html: "Crie uma página web (HTML) a partir do material anexado. Distribua os pontos principais para que fiquem fáceis de ler.",
    mindmap: "Crie um mapa mental a partir do material anexado. Coloque o tema principal no centro e organize os pontos-chave como ramos."
  },
  it: {
    slides: "Crea una presentazione dal materiale allegato. Organizza i punti principali in diapositive con titoli chiari.",
    html: "Crea una pagina web (HTML) dal materiale allegato. Disponi i punti principali in modo che siano facili da leggere.",
    mindmap: "Crea una mappa mentale dal materiale allegato. Metti l’argomento principale al centro e organizza i punti chiave come rami."
  },
  pl: {
    slides: "Przygotuj prezentację na podstawie załączonych materiałów. Uporządkuj najważniejsze punkty w slajdy z wyraźnymi tytułami.",
    html: "Przygotuj stronę internetową (HTML) na podstawie załączonych materiałów. Rozmieść najważniejsze punkty tak, by łatwo się je czytało.",
    mindmap: "Przygotuj mapę myśli na podstawie załączonych materiałów. Umieść główny temat w środku, a kluczowe punkty ułóż w gałęzie."
  },
  cs: {
    slides: "Vytvoř prezentaci z přiložených materiálů. Uspořádej hlavní body do snímků s jasnými nadpisy.",
    html: "Vytvoř webovou stránku (HTML) z přiložených materiálů. Rozvrhni hlavní body tak, aby se dobře četly.",
    mindmap: "Vytvoř myšlenkovou mapu z přiložených materiálů. Hlavní téma dej doprostřed a klíčové body uspořádej do větví."
  },
  nl: {
    slides: "Maak een presentatie van het bijgevoegde materiaal. Orden de belangrijkste punten in dia’s met duidelijke titels.",
    html: "Maak een webpagina (HTML) van het bijgevoegde materiaal. Zet de belangrijkste punten overzichtelijk neer.",
    mindmap: "Maak een mindmap van het bijgevoegde materiaal. Zet het hoofdonderwerp in het midden en orden de kernpunten als takken."
  },
  ms: {
    slides: "Buat persembahan daripada bahan yang dilampirkan. Susun isi utama menjadi slaid dengan tajuk yang jelas.",
    html: "Buat halaman web (HTML) daripada bahan yang dilampirkan. Susun isi utama supaya mudah dibaca.",
    mindmap: "Buat peta minda daripada bahan yang dilampirkan. Letakkan topik utama di tengah dan susun isi penting sebagai cabang."
  },
  he: {
    slides: "צור מצגת מהחומר המצורף. ארגן את הנקודות העיקריות בשקופיות עם כותרות ברורות.",
    html: "צור דף אינטרנט (HTML) מהחומר המצורף. סדר את הנקודות העיקריות כך שיהיה קל לקרוא אותן.",
    mindmap: "צור מפת חשיבה מהחומר המצורף. שים את הנושא המרכזי במרכז וארגן את נקודות המפתח כענפים."
  },
  hi: {
    slides: "संलग्न सामग्री से एक प्रस्तुति बनाइए। मुख्य बातों को स्पष्ट शीर्षकों वाली स्लाइडों में व्यवस्थित कीजिए।",
    html: "संलग्न सामग्री से एक वेब पेज (HTML) बनाइए। मुख्य बातों को इस तरह रखिए कि उन्हें पढ़ना आसान हो।",
    mindmap: "संलग्न सामग्री से एक माइंड मैप बनाइए। मुख्य विषय को बीच में रखिए और प्रमुख बातों को शाखाओं के रूप में व्यवस्थित कीजिए।"
  },
  "zh-TW": {
    slides: "請根據附件資料製作一份簡報。整理出重點，做成標題清楚的投影片。",
    html: "請根據附件資料製作一個網頁（HTML）。把重點排得清楚易讀。",
    mindmap: "請根據附件資料製作一張心智圖。把主題放在中心，用分支整理重點。"
  },
  vi: {
    slides: "Hãy tạo một bài thuyết trình từ tài liệu đính kèm. Sắp xếp các ý chính thành các trang chiếu có tiêu đề rõ ràng.",
    html: "Hãy tạo một trang web (HTML) từ tài liệu đính kèm. Bố trí các ý chính sao cho dễ đọc.",
    mindmap: "Hãy tạo một sơ đồ tư duy từ tài liệu đính kèm. Đặt chủ đề chính ở giữa và sắp xếp các ý quan trọng thành các nhánh."
  }
};
function defaultGeneratePrompt(lang, kind) {
  return (DEFAULT_GENERATE_PROMPTS[lang] ?? DEFAULT_GENERATE_PROMPTS.en)[kind];
}
const KIND_LABEL = {
  slides: "kindSlides",
  html: "kindHtml",
  mindmap: "kindMindmap"
};
const CONVERT_LABEL = {
  "mindmap-to-markdown": "convertToMarkdown",
  "mindmap-to-slides": "convertToSlides",
  "markdown-to-mindmap": "convertToMindmap"
};
const CONVERT_PROBLEM_LABEL = {
  unreadable: "convertUnreadable",
  redaction: "convertRedactionFailed",
  "too-many-slides": "convertTooManySlides",
  failed: "convertFailed"
};
const PROBLEM_LABEL = {
  missing: "reasonMissing",
  unsupported: "reasonUnsupported",
  "too-large": "reasonTooLarge",
  unreadable: "reasonUnreadable",
  untitled: "reasonUntitled"
};
function NoticeIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 16 16", "aria-hidden": "true", className: "gen-icon", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: "M8 1.8 15 14H1z",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.3",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 6v3.6", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "8", cy: "11.7", r: ".8", fill: "currentColor" })
  ] });
}
function GenerateWindow() {
  const api2 = window.aiOfficeGenerateWindow;
  const [state, setState] = reactExports.useState(null);
  const [text, setText] = reactExports.useState("");
  reactExports.useEffect(() => {
    let alive = true;
    void api2.getState().then((s) => {
      if (alive && s) setState(s);
    });
    const off = api2.onState((s) => setState(s));
    return () => {
      alive = false;
      off();
    };
  }, [api2]);
  const lang = state?.lang;
  reactExports.useEffect(() => {
    if (!lang) return;
    document.documentElement.lang = htmlLang(lang);
    document.documentElement.dir = htmlDir(lang);
    document.title = generateText(lang, "windowTitle");
  }, [lang]);
  reactExports.useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") void api2.cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [api2]);
  if (!state) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-boot" });
  const t = (key, params) => generateText(state.lang, key, params);
  const listed = state.materials.filter((m) => m.state !== "excluded");
  const unsaved = state.materials.filter((m) => m.state === "unsaved");
  const excluded = state.materials.filter((m) => m.state === "excluded");
  const busy = state.making;
  const converting = state.mode === "convert";
  const make = () => {
    if (state.canMake) void api2.make(converting ? "" : text);
  };
  const saveButton = (m) => {
    const saving = state.saving.includes(m.key);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "gen-btn gen-btn-small",
        "data-testid": "gen-save-material",
        disabled: saving || busy,
        onClick: () => void api2.saveMaterial(m.key),
        children: saving ? t("savingMaterial") : m.saveAction === "save" ? t("saveMaterial") : t("showMaterial")
      }
    );
  };
  const removeButton = (m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      className: "gen-icon-btn",
      "aria-label": `${t("removeMaterial")}: ${m.name}`,
      title: t("removeMaterial"),
      disabled: busy,
      onClick: () => void api2.removeMaterial(m.key),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2.5 2.5l7 7M9.5 2.5l-7 7", stroke: "currentColor", strokeWidth: "1.4" }) })
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen", "data-testid": "generate-window", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "gen-head", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "gen-title", children: t("windowTitle") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-body", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "gen-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-label", id: "gen-kind-label", children: t("kindLabel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-kinds", role: "radiogroup", "aria-labelledby": "gen-kind-label", children: AI_TARGET_KINDS.map((kind) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            role: "radio",
            "aria-checked": !converting && state.kind === kind,
            "data-kind": kind,
            className: `gen-kind${!converting && state.kind === kind ? " active" : ""}`,
            disabled: busy,
            onClick: () => void api2.setKind(kind),
            children: t(KIND_LABEL[kind])
          },
          kind
        )) }),
        state.conversions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-convert", "data-testid": "gen-convert", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-sublabel", id: "gen-convert-label", children: t("convertLabel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-kinds", role: "radiogroup", "aria-labelledby": "gen-convert-label", children: state.conversions.map((kind) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              role: "radio",
              "aria-checked": state.convertKind === kind,
              "data-convert": kind,
              className: `gen-kind${state.convertKind === kind ? " active" : ""}`,
              disabled: busy,
              onClick: () => void api2.setConvert(kind),
              children: t(CONVERT_LABEL[kind])
            },
            kind
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "gen-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-row-head", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gen-label", children: t("materialsLabel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "gen-btn gen-btn-small",
              "data-testid": "gen-add-materials",
              disabled: busy,
              onClick: () => void api2.addMaterials(),
              children: t("addMaterials")
            }
          )
        ] }),
        listed.length === 0 && excluded.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-empty", children: t("emptyMaterials") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "gen-list", "data-testid": "gen-materials", children: listed.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "li",
          {
            className: `gen-item gen-item-${m.state}`,
            "data-state": m.state,
            "data-name": m.name,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gen-item-name", title: m.path ?? m.name, children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gen-item-size", "data-testid": "gen-item-size", children: m.state === "checking" ? t("checking") : m.sizeBytes !== void 0 ? formatBytes(m.sizeBytes, state.lang) : "" }),
              removeButton(m)
            ]
          },
          m.key
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-total", "data-testid": "gen-total", children: state.checking ? t("checking") : t(state.readyCount === 1 ? "totalLineOne" : "totalLine", {
          n: state.readyCount,
          size: formatBytes(state.totalBytes, state.lang)
        }) }),
        unsaved.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-callout gen-callout-block", "data-testid": "gen-unsaved", role: "alert", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-callout-title", children: t("unsavedTitle") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-callout-body", children: t("unsavedBody") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "gen-sublist", children: unsaved.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "gen-subitem", "data-name": m.name, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gen-item-name", title: m.path ?? m.name, children: m.name }),
            saveButton(m)
          ] }, m.key)) })
        ] }),
        excluded.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-excluded", "data-testid": "gen-excluded", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-sublabel", children: t("excludedLabel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "gen-sublist", children: excluded.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "gen-subitem",
              "data-problem": m.problem,
              "data-name": m.name,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "gen-subitem-text", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gen-item-name", title: m.path ?? m.name, children: m.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gen-reason", children: m.problem ? t(PROBLEM_LABEL[m.problem], {
                    mb: m.limitMb ?? state.limits.maxMaterialMb
                  }) : "" })
                ] }),
                m.saveAction && saveButton(m),
                removeButton(m)
              ]
            },
            m.key
          )) })
        ] })
      ] }),
      converting && state.redactionNotice && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-notices", "data-testid": "gen-redaction-notice", role: "status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-callout", "data-notice": "redacted", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NoticeIcon, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("noticeRedacted") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "gen-section", hidden: converting, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "gen-label", htmlFor: "gen-request", children: t("requestLabel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            id: "gen-request",
            className: "gen-request",
            rows: 4,
            value: text,
            placeholder: defaultGeneratePrompt(state.lang, state.kind),
            disabled: busy,
            onChange: (event) => setText(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) make();
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-hint", children: t("requestHint") })
      ] }),
      (state.notices.usage || state.notices.longMaterial) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-notices", "data-testid": "gen-notices", role: "status", children: [
        state.notices.usage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-callout", "data-notice": "usage", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NoticeIcon, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("noticeUsage") })
        ] }),
        state.notices.longMaterial && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-callout", "data-notice": "long", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NoticeIcon, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("noticeLong") })
        ] })
      ] }),
      state.tooMany && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-blocker", "data-testid": "gen-too-many", children: t("tooMany", { max: state.limits.maxMaterials }) }),
      !state.checking && state.readyCount === 0 && state.materials.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-blocker", children: t("noReadable") }),
      state.failure && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gen-blocker", role: "alert", "data-testid": "gen-failure", children: state.failure === "convert" ? t(CONVERT_PROBLEM_LABEL[state.convertProblem ?? "failed"], {
        max: state.limits.maxConvertSlides
      }) : state.failure === "make" ? t("makeFailed") : t("saveFailed") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "gen-foot", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gen-hint gen-foot-hint", children: converting ? t("convertHint") : t("makeHint") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "gen-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "gen-btn", onClick: () => void api2.cancel(), children: t("cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "gen-btn gen-btn-primary",
            "data-testid": "gen-make",
            disabled: !state.canMake,
            onClick: make,
            children: busy ? t("making") : t("make")
          }
        )
      ] })
    ] })
  ] });
}
function applyTheme(theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}
const api = window.aiOfficeGenerateWindow;
void api.getTheme().then((theme) => {
  applyTheme(theme);
  api.onThemeChanged(applyTheme);
  clientExports.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(GenerateWindow, {}) })
  );
});
