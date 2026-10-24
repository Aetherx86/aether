"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const path = require("node:path");
const require$$1 = require("node:url");
const index = require("./index.js");
let ocrEngine;
function ensureOcrEngine() {
  if (ocrEngine !== void 0) return ocrEngine;
  const here = path.dirname(require$$1.fileURLToPath(require("url").pathToFileURL(__filename).href));
  const helper = process.platform === "darwin" ? "vision-ocr" : "win-ocr.exe";
  const create = process.platform === "darwin" ? index.createVisionOcrEngine : index.createWindowsOcrEngine;
  const candidates = [
    ...process.resourcesPath ? [path.join(process.resourcesPath, "ocr", helper)] : [],
    path.join(here, "../../../../packages/pdf2docx/ocr-helper", helper)
  ];
  ocrEngine = null;
  for (const path2 of candidates) {
    const engine = create(path2);
    if (engine) {
      ocrEngine = engine;
      break;
    }
  }
  return ocrEngine;
}
function ocrPagePng(pngBase64) {
  const engine = ensureOcrEngine();
  if (!engine) return null;
  let png;
  try {
    png = Uint8Array.from(Buffer.from(pngBase64, "base64"));
  } catch {
    return [];
  }
  const result = engine(png, { widthPt: 0, heightPt: 0 });
  if (!result) return [];
  return result.lines.map((l) => ({
    text: l.text,
    confidence: l.confidence,
    box: [l.box.x0, l.box.y0, l.box.x1, l.box.y1],
    ...l.chars ? {
      chars: l.chars.map((c) => ({
        text: c.text,
        box: [c.box.x0, c.box.y0, c.box.x1, c.box.y1]
      }))
    } : {}
  }));
}
exports.ocrPagePng = ocrPagePng;
