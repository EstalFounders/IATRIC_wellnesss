/**
 * DoctorStampGenerator.js
 *
 * Generates a circular rubber-stamp SVG for a doctor.
 * Input:  { name, degree, dmcNo }
 * Output: SVG markup string OR a data-URL (inline <img> src)
 *
 * Layout (vertical stack, no arc text):
 *   ┌─────────────────────┐
   │      ╭──────╮       │
   │  Doctor Name (bold)  │
   │   MBBS, MD (degree)  │
   │    DMC-12345 (reg)   │
   │      ╰──────╯       │
 *   └─────────────────────┘
 *
 * Also exports a jsPDF draw helper.
 */

// ─────────────────────────────────────────────────────
// 1.  SVG string generator
// ─────────────────────────────────────────────────────

import { capitalize } from "../utils/helper";

/**
 * @typedef {Object} StampInput
 * @property {string} name      – Doctor name
 * @property {string} degree    – Degree abbreviation (e.g. "MBBS, MD")
 * @property {string} dmcNo     – DMC / registration number
 */

/**
 * Build a full SVG document string for a rectangular doctor stamp.
 *
 * @param {StampInput} input
 * @param {object}     [opts]
 * @param {string}     [opts.ink='#1a56db']    – Stamp ink colour (blue)
 * @param {number}     [opts.width=300]         – Viewport width (px)
 * @param {number}     [opts.height=180]        – Viewport height (px)
 * @param {number}     [opts.borderWidth=4]     – Outer border stroke width
 * @returns {string}   SVG markup
 */
export function buildStampSvg({ name, degree, dmcNo }, opts = {}) {
  const ink = opts.ink ?? "#1a56db";
  const W = opts.width ?? 300;
  const H = opts.height ?? 180;
  const bw = opts.borderWidth ?? 4;
  const pad = 12;                     // inner padding from border
  const cx = W / 2;                   // horizontal centre

  // Escape XML special chars
  const esc = (s) =>
    (s ?? "").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");

  // Prepend "Dr. " to the doctor's name and apply Title Case
  const safeName = esc(
    capitalize(name && !name.startsWith("Dr.") ? `Dr. ${name}` : name || ""),
  );
  const safeDegree = esc(degree);
  const safeDmc = esc(dmcNo ? `DMC - ${dmcNo}` : "—");

  // ── Layout y-offsets from top ─────────────────────
  const Y_NAME = 46;                 // Name block (near top)
  const Y_DEG_START = 84;            // Degree block (middle)
  const Y_DEG_LH = 18;               // Degree line-height
  const Y_DMC = 130;                 // DMC block (bottom area)

  // ── Available text width ──────────────────────────
  //   Rectangular: full inner width minus padding on both sides
  const innerW = W - (pad + bw) * 2;

  //   We apply a 90 % safety margin
  const wName = innerW * 0.90;
  const wDeg  = innerW * 0.90;
  const wDmc  = innerW * 0.90;

  // ── Dynamic font sizing ───────────────────────────
  const RATIO = 0.55;

  const fitSize = (text, maxWidth, maxSize, minSize) => {
    const len = text.length || 1;
    const ideal = Math.floor(maxWidth / (len * RATIO));
    return Math.max(minSize, Math.min(maxSize, ideal));
  };

  let nameFs = fitSize(safeName, wName, 27, 19);
  let degFs  = fitSize(safeDegree, wDeg, 21, 17);
  let dmcFs  = fitSize(safeDmc, wDmc, 19, 17);

  // ── Line-wrapping ─────────────────────────────────
  const charsPerLine = (fs, mw) => Math.max(1, Math.floor(mw / (fs * RATIO)));

  let nameMaxPerLine = charsPerLine(nameFs, wName);
  let nameLines = splitToLines(safeName, nameMaxPerLine);
  while (nameLines.length > 2 && nameFs > 19) {
    nameFs -= 1;
    nameMaxPerLine = charsPerLine(nameFs, wName);
    nameLines = splitToLines(safeName, nameMaxPerLine);
  }

  let degMaxPerLine = charsPerLine(degFs, wDeg);
  let degLines = splitToLines(safeDegree, degMaxPerLine);
  while (degLines.length > 2 && degFs > 17) {
    degFs -= 1;
    degMaxPerLine = charsPerLine(degFs, wDeg);
    degLines = splitToLines(safeDegree, degMaxPerLine);
  }

  let dmcMaxPerLine = charsPerLine(dmcFs, wDmc);
  let dmcLines = splitToLines(safeDmc, dmcMaxPerLine);
  while (dmcLines.length > 1 && dmcFs > 17) {
    dmcFs -= 1;
    dmcMaxPerLine = charsPerLine(dmcFs, wDmc);
    dmcLines = splitToLines(safeDmc, dmcMaxPerLine);
  }

  // ── Build text elements ───────────────────────────
  const textTag = (lines, x, startY, fs, lh, weight) =>
    lines
      .map(
        (line, i) =>
          `<text x="${x}" y="${startY + i * lh}" fill="${ink}"
             text-anchor="middle"
             font-size="${fs}px"
             font-weight="${weight}"
             font-family="sans-serif">${line}</text>`,
      )
      .join("\n    ");

  const nameBlock = textTag(nameLines, cx, Y_NAME, nameFs, nameFs + 3, "bold");
  const degBlock  = textTag(degLines,  cx, Y_DEG_START, degFs, degFs + 3, "600");
  const dmcBlock  = textTag(dmcLines,  cx, Y_DMC, dmcFs, dmcFs + 3, "normal");

  // ── Assemble rectangular SVG ──────────────────────
  return `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <style>
    .box { fill:none; stroke:${ink}; }
  </style>

  <!-- Outer double rectangle -->
  <rect x="${bw/2}" y="${bw/2}" width="${W - bw}" height="${H - bw}"
        rx="8" ry="8" class="box" stroke-width="${bw}"/>
  <rect x="${bw + pad - 4}" y="${bw + pad - 4}"
        width="${W - (bw + pad) * 2 + 8}" height="${H - (bw + pad) * 2 + 8}"
        rx="5" ry="5" class="box" stroke-width="1.8"/>

  <!-- Doctor Name (bold, top) -->
  ${nameBlock}

  <!-- Degree (medium, middle) -->
  ${degBlock}

  <!-- DMC No (bottom) -->
  ${dmcBlock}
</svg>`;
}

// ─────────────────────────────────────────────────────
// 2.  Data-URL helper
// ─────────────────────────────────────────────────────

/**
 * Return an inline data-URL suitable for <img src="…">.
 *
 * @param {StampInput} input
 * @param {object}     [opts]
 * @returns {string}   data:image/svg+xml;base64,…
 */
export function stampDataUrl(input, opts) {
  const svg = buildStampSvg(input, opts);
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(svg, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

// ─────────────────────────────────────────────────────
// 3.  jsPDF draw commands (rectangular, blue)
// ─────────────────────────────────────────────────────

/**
 * Paint the stamp directly onto a jsPDF document.
 *
 * @param {import("jspdf").jsPDF} doc  – An existing jsPDF instance
 * @param {StampInput}            input
 * @param {number}                x     – Left edge (mm)
 * @param {number}                y     – Top edge (mm)
 * @param {number}                [w=40] – Width (mm)
 * @param {number}                [h=24] – Height (mm)
 * @param {object}                [opts]
 * @param {number[]}              [opts.ink=[26,86,219]] – RGB blue
 */
export function drawStampOnPdf(doc, input, x, y, w = 40, h = 24, opts = {}) {
  const ink = opts.ink ?? [26, 86, 219];
  const [cr, cg, cb] = ink;
  const bw = 1.0;
  const cx = x + w / 2;

  doc.setDrawColor(cr, cg, cb);
  doc.setFillColor(cr, cg, cb);

  // Outer double rectangle with rounded corners
  doc.setLineWidth(bw);
  doc.roundedRect(x, y, w, h, 2, 2, "S");
  doc.setLineWidth(0.4);
  doc.roundedRect(x + 2.5, y + 2.5, w - 5, h - 5, 1.5, 1.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(cr, cg, cb);

  // Prepend "Dr. " to name and apply Title Case
  const stampName = capitalize(
    input.name && !input.name.startsWith("Dr.") ? `Dr. ${input.name}` : input.name || "",
  );

  // Layout y positions (mm from top)
  const nameY = y + h * 0.28;
  const degY  = y + h * 0.52;
  const degLh = h * 0.13;
  const dmcY  = y + h * 0.78;

  // Font sizing
  const nameFs = Math.max(5, Math.min(12, w * 0.20));
  const degFs  = Math.max(5, Math.min(11, w * 0.16));
  const dmcFs  = Math.max(4, Math.min(10, w * 0.14));

  const nameLines = splitToLines(stampName, 18);
  const degLines  = splitToLines(input.degree, 22);
  const dmcLines  = splitToLines(input.dmcNo ? `DMC - ${input.dmcNo}` : "—", 22);

  doc.setFontSize(nameFs);
  nameLines.forEach((line, i) => doc.text(line, cx, nameY + i * (nameFs * 0.5), { align: "center" }));
  doc.setFontSize(degFs);
  degLines.forEach((line, i) => doc.text(line, cx, degY + i * degLh, { align: "center" }));
  doc.setFontSize(dmcFs);
  dmcLines.forEach((line, i) => doc.text(line, cx, dmcY + i * (dmcFs * 0.5), { align: "center" }));

  doc.setTextColor(0, 0, 0);
}

// ─────────────────────────────────────────────────────
// 4.  HTML Canvas draw (rectangular, blue)
// ─────────────────────────────────────────────────────

/**
 * Draw the stamp onto an HTML Canvas 2D context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {StampInput}               input
 * @param {number}                   x  – Left edge (px)
 * @param {number}                   y  – Top edge (px)
 * @param {number}                   [w=300] – Width (px)
 * @param {number}                   [h=180] – Height (px)
 * @param {object}                   [opts]
 * @param {string}                   [opts.ink='#1a56db']
 */
export function drawStampOnCanvas(ctx, input, x, y, w = 300, h = 180, opts = {}) {
  const ink = opts.ink ?? "#1a56db";
  const bw = 4;
  const cx = x + w / 2;

  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;

  // Outer double rectangle
  ctx.lineWidth = bw;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(x + 10, y + 10, w - 20, h - 20, 5);
  ctx.stroke();

  ctx.textAlign = "center";

  // Prepend "Dr. " to name and apply Title Case
  const stampName = capitalize(
    input.name && !input.name.startsWith("Dr.") ? `Dr. ${input.name}` : input.name || "",
  );

  const nameLines = splitToLines(stampName, 20);
  const degLines  = splitToLines(input.degree, 26);
  const dmcLines  = splitToLines(input.dmcNo ? `DMC - ${input.dmcNo}` : "—", 26);

  // Name
  const nameFs = Math.max(17, Math.min(25, w * 0.07));
  ctx.font = `bold ${nameFs}px sans-serif`;
  const nameY = y + h * 0.28;
  nameLines.forEach((line, i) => ctx.fillText(line, cx, nameY + i * (nameFs * 0.6)));

  // Degree
  const degFs = Math.max(15, Math.min(19, w * 0.05));
  ctx.font = `600 ${degFs}px sans-serif`;
  const degY = y + h * 0.52;
  degLines.forEach((line, i) => ctx.fillText(line, cx, degY + i * (degFs * 0.6)));

  // DMC
  const dmcFs = Math.max(14, Math.min(17, w * 0.045));
  ctx.font = `${dmcFs}px sans-serif`;
  const dmcY = y + h * 0.78;
  dmcLines.forEach((line, i) => ctx.fillText(line, cx, dmcY + i * (dmcFs * 0.6)));

  ctx.restore();
}

// ─────────────────────────────────────────────────────
// 5.  Helpers
// ─────────────────────────────────────────────────────

/**
 * Split text into lines no longer than `maxLen` characters,
 * preferring word boundaries.
 */
function splitToLines(str, maxLen) {
  if (!str) return [""];
  const words = str.split(/\s+/);
  const lines = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? current + " " + w : w;
    if (candidate.length > maxLen && current.length > 0) {
      lines.push(current.trim());
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.length ? lines : [""];
}

// ─────────────────────────────────────────────────────
// 6.  Convenience – raw SVG string
// ─────────────────────────────────────────────────────

export function stampSvgElement(input, opts) {
  return buildStampSvg(input, opts);
}

export default {
  buildStampSvg,
  stampDataUrl,
  drawStampOnPdf,
  drawStampOnCanvas,
  stampSvgElement,
};
