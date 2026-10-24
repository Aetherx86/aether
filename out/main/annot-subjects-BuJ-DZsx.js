"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const index = require("./index.js");
const MARKUP_SUBTYPES = /* @__PURE__ */ new Set(["Highlight", "Underline", "StrikeOut"]);
async function readAnnotSubjects(bytes) {
  let doc;
  try {
    doc = await index.PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  } catch {
    return [];
  }
  if (doc.isEncrypted) return [];
  const out = [];
  doc.getPages().forEach((page, pageIndex) => {
    const annots = page.node.lookupMaybe(index.PDFName.of("Annots"), index.PDFArray);
    if (!annots) return;
    for (let i = 0; i < annots.size(); i++) {
      const entry = annots.get(i);
      if (!(entry instanceof index.PDFRef)) continue;
      const dict = doc.context.lookupMaybe(entry, index.PDFDict);
      if (!dict) continue;
      const subtype = dict.lookupMaybe(index.PDFName.of("Subtype"), index.PDFName)?.decodeText();
      if (!subtype || !MARKUP_SUBTYPES.has(subtype)) continue;
      const subj = dict.lookup(index.PDFName.of("Subj"));
      if (!(subj instanceof index.PDFString) && !(subj instanceof index.PDFHexString)) continue;
      const text = subj.decodeText().trim();
      if (text) out.push({ pageIndex, objNum: entry.objectNumber, subj: text });
    }
  });
  return out;
}
exports.readAnnotSubjects = readAnnotSubjects;
