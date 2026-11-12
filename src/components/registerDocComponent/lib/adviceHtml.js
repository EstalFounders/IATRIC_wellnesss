// Shared helpers for the rich "Advices" field.
//
// The advice box became a small rich-text field (bold / underline / tables), so
// the HTML it produces has to be normalised before it is stored, mirrored into
// the plain `advices` field and printed by `DoctorPrescriptionGenerator`. This
// module is the single place that decides what survives:
//
//   - tag whitelist only (formatting + lists + tables) - no `class`, `style`,
//     `id`, `href`, `on*`, so pasted markup can never inject CSS/JS or handlers;
//   - every non-whitelisted element is unwrapped (its text is kept), and
//     `script` / `style` / embedded media are dropped entirely;
//   - `sanitizeAdviceHtml(html, { dropEmptyTables: true })` is used by the PDF so
//     a table the doctor inserted but never filled in doesn't print as an empty
//     grid.
//
// No dependency: this runs on the DOM the app already has.

const ALLOWED_TAGS = new Set([
  "B",
  "STRONG",
  "U",
  "I",
  "EM",
  "BR",
  "P",
  "DIV",
  "UL",
  "OL",
  "LI",
  "TABLE",
  "THEAD",
  "TBODY",
  "TR",
  "TD",
  "TH",
]);

// Elements whose *content* is never readable text - dropped with their subtree.
const DROPPED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "LINK",
  "META",
  "NOSCRIPT",
  "TEMPLATE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "IMG",
  "SVG",
  "INPUT",
  "BUTTON",
  "TEXTAREA",
  "SELECT",
]);

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

// Escapes user text before it is inserted as HTML (presets, pasted text).
export const escapeAdviceHtml = (text) =>
  String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// A rows x cols table with one empty cell per column, ready for `insertHTML`.
// `marker` lands on the <table> only so the editor can find it right after the
// insertion and drop the caret into the first cell - it is stripped by the
// sanitiser like every other attribute.
export const buildAdviceTableHtml = (rows = 2, cols = 2, marker = "") => {
  const safeRows = Math.min(6, Math.max(1, Number(rows) || 2));
  const safeCols = Math.min(6, Math.max(1, Number(cols) || 2));
  const rowHtml = `<tr>${Array.from({ length: safeCols }, () => "<td><br></td>").join("")}</tr>`;
  const attr = marker ? ` data-advice-tmp="${escapeAdviceHtml(marker)}"` : "";
  return `<table${attr}><tbody>${Array.from(
    { length: safeRows },
    () => rowHtml,
  ).join("")}</tbody></table><br>`;
};

export const sanitizeAdviceHtml = (html, { dropEmptyTables = false } = {}) => {
  if (!html) return "";
  // Server-side render pass: nothing to sanitise against, and the value is only
  // ever painted on the client.
  if (typeof document === "undefined") return String(html);

  const source = document.createElement("template");
  source.innerHTML = String(html);
  const output = document.createElement("div");

  const copy = (node, target) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === TEXT_NODE) {
        target.appendChild(document.createTextNode(child.nodeValue));
        return;
      }
      if (child.nodeType !== ELEMENT_NODE) return;
      const tag = child.tagName.toUpperCase();
      if (DROPPED_TAGS.has(tag)) return;
      if (!ALLOWED_TAGS.has(tag)) {
        // Unknown wrapper (span, font, a, …): keep the text, drop the element.
        copy(child, target);
        return;
      }
      const clone = document.createElement(tag);
      target.appendChild(clone);
      copy(child, clone);
    });
  };

  copy(source.content, output);

  if (dropEmptyTables) {
    output.querySelectorAll("table").forEach((table) => {
      if (!table.textContent.trim()) table.remove();
    });
  }

  return output.innerHTML;
};

// Plain-text mirror of the rich field. Kept in the existing `advices` key so
// every older consumer (and the PDF fallback for plain data) keeps working:
// line breaks stay line breaks, table rows stay line breaks and cells are
// separated by " | ".
export const adviceHtmlToPlainText = (html) => {
  if (!html) return "";
  if (typeof document === "undefined") return String(html);

  const holder = document.createElement("div");
  holder.innerHTML = String(html);

  holder.querySelectorAll("br").forEach((br) => {
    br.replaceWith(document.createTextNode("\n"));
  });
  holder.querySelectorAll("td, th").forEach((cell) => {
    cell.appendChild(document.createTextNode(" | "));
  });
  holder.querySelectorAll("p, div, li, tr").forEach((block) => {
    block.appendChild(document.createTextNode("\n"));
  });

  return holder.textContent
    .replace(/[ \t]*\|[ \t]*(?=\n)/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// True when the sanitised HTML would actually print something.
export const hasAdviceContent = (html) =>
  adviceHtmlToPlainText(html) !== "" || /<table[\s>]/i.test(String(html || ""));
