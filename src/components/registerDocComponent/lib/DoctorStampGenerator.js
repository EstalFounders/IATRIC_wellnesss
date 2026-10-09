/**
 * DoctorStampGenerator.js
 *
 * Generates a rubber-stamp SVG for a doctor - one shared design for every
 * doctor profile (present and future).
 * Input:  { name, specialization, regNo }   // `dmcNo` still accepted
 * Output: SVG markup string OR a data-URL (inline <img> src)
 *
 * Layout (vertical stack, no arc text):
 *   ┌─────────────────────┐
   │      ╭──────╮       │
   │  Doctor Name (bold)  │
   │   Specialization     │
   │   Reg. No: 12345     │
   │      ╰──────╯       │
 *   └─────────────────────┘
 *
 * Also exports a jsPDF draw helper.
 */

// ─────────────────────────────────────────────────────
// 1.  SVG string generator
// ─────────────────────────────────────────────────────

import { capitalize } from "../utils/helper";
import { doctorDisplayName } from "../../../utils/doctorName";

// ─────────────────────────────────────────────────────
// 0.  Shared stamp model (SVG + jsPDF + Canvas)
// ─────────────────────────────────────────────────────

// Stamp ink - the same blue in both flavours: CSS hex for the screen (SVG /
// canvas) and an RGB vector for the PDF.
const STAMP_INK = "#1a56db";
const STAMP_INK_RGB = [26, 86, 219];

/**
 * The lines printed on the standard stamp, top to bottom:
 * NAME / SPECIALIZATION / REG. NO. Every doctor profile gets the same stamp
 * (the old degree line is gone) and the REG. NO row is compulsory - it prints
 * for every profile, as `STAMP_REG_NO_PLACEHOLDER` while the number is missing.
 * Sizes are fractions of the stamp *width*, so a
 * single model renders the same stamp as SVG pixels (300 x 180), jsPDF
 * millimetres (the measured stamp box) and canvas pixels.
 *
 * `wrap` = how many wrapped lines are tolerated before that line shrinks.
 */
const STAMP_LINES = [
  { key: "name", weight: "bold", maxFs: 0.09, minFs: 0.05, wrap: 2 },
  { key: "specialization", weight: "600", maxFs: 0.067, minFs: 0.047, wrap: 2 },
  { key: "regNo", weight: "normal", maxFs: 0.06, minFs: 0.047, wrap: 1 },
];

const STAMP_TEXT_RATIO = 0.55; // average glyph width / font size
const STAMP_SAFE_WIDTH = 0.9; // text never uses more than 90 % of the box width
const STAMP_SAFE_HEIGHT = 0.82; // the stack never uses more than 82 % of the height

/**
 * The registration row is compulsory: while a (legacy) profile has no number
 * yet, the stamp still prints the row with this text instead of dropping it. A
 * real number is never invented and the line never disappears by accident.
 */
const STAMP_REG_NO_PLACEHOLDER = "Reg. No: Not provided";

/** First entry of a comma separated list ("" when there is nothing to read). */
const firstEntry = (value) =>
  String(value ?? "")
    .split(",")[0]
    .trim();

/** XML-escape a text node (a doctor name may contain "&"). */
const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Normalise a stamp input into the printable lines. The three rows are fixed:
 * NAME / SPECIALIZATION / REG. NO - the registration number is compulsory on the
 * doctor profile, so that row is never dropped: a profile that has not been
 * filled in yet prints `STAMP_REG_NO_PLACEHOLDER`. Only name and specialization
 * are still omitted when they are empty. `dmcNo` is kept as a legacy alias of
 * `regNo`.
 *
 * @param {StampInput} input
 * @returns {Array<{key: string, text: string, weight: string,
 *                  maxFs: number, minFs: number, wrap: number}>}
 */
function stampContent(input = {}) {
  const name = input.name || "";
  const regNo = String(input.regNo ?? input.dmcNo ?? "").trim();

  return [
    {
      ...STAMP_LINES[0],
      text: capitalize(doctorDisplayName(name)),
    },
    // Only the primary entry of a comma separated list fits on a stamp.
    { ...STAMP_LINES[1], text: firstEntry(input.specialization) },
    // Compulsory row - never empty, so the filter below can only drop the two
    // rows above it.
    {
      ...STAMP_LINES[2],
      text: regNo ? `Reg. No: ${regNo}` : STAMP_REG_NO_PLACEHOLDER,
    },
  ].filter((line) => line.text);
}

/**
 * Lay the stamp lines out as a vertically centred stack inside a `w` x `h` box.
 * The units are the caller's own (SVG pixels, jsPDF millimetres, canvas
 * pixels); every renderer below goes through this helper, so the stamp on
 * screen, in the DOM data-URL and in the PDF can never drift apart.
 *
 * @returns {Array<{text: string, weight: string, fs: number, lh: number,
 *                  lines: string[], firstBaseline: number}>}
 */
function layoutStampStack(input, w, h) {
  const innerW = w * STAMP_SAFE_WIDTH;
  const gap = w * 0.02;
  const lineHeight = (fs) => fs + w * 0.01;
  const stackHeight = (items) =>
    items.reduce(
      (sum, item, index) =>
        sum + item.lines.length * item.lh + (index ? gap : 0),
      0,
    );

  // A long value first shrinks inside its own line budget; if the wrapped stack
  // is still taller than the box, the whole stack shrinks together.
  let scale = 1;
  let items = [];
  for (let attempt = 0; attempt < 10; attempt += 1) {
    items = stampContent(input).map((line) => {
      const minFs = w * line.minFs * scale;
      let fs = w * line.maxFs * scale;
      let lines = [line.text];
      for (let step = 0; step < 8; step += 1) {
        const perLine = Math.max(
          4,
          Math.floor(innerW / (fs * STAMP_TEXT_RATIO)),
        );
        lines = splitToLines(line.text, perLine);
        if (lines.length <= line.wrap || fs <= minFs) break;
        fs = Math.max(minFs, fs - w * 0.006);
      }
      return { ...line, fs, lines, lh: lineHeight(fs) };
    });

    if (stackHeight(items) <= h * STAMP_SAFE_HEIGHT || scale <= 0.6) break;
    scale -= 0.08;
  }

  // Centre the stack; the first baseline sits one ascent below its block top
  // (`y` is a text baseline in both SVG and jsPDF).
  let cursor = (h - stackHeight(items)) / 2;
  return items.map((item) => {
    const placed = { ...item, firstBaseline: cursor + item.fs };
    cursor += item.lines.length * item.lh + gap;
    return placed;
  });
}

/**
 * @typedef {Object} StampInput
 * @property {string} name           – Doctor name
 * @property {string} specialization – Specialization (first entry of a list)
 * @property {string} regNo          – Registration number (compulsory; the row
 *                                      prints `STAMP_REG_NO_PLACEHOLDER` while
 *                                      the profile has no number)
 * @property {string} [dmcNo]        – Legacy alias of `regNo`
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
export function buildStampSvg(input, opts = {}) {
  const ink = opts.ink ?? STAMP_INK;
  const W = opts.width ?? 300;
  const H = opts.height ?? 180;
  const bw = opts.borderWidth ?? 4;
  const pad = 12; // inner padding from the border
  const cx = W / 2; // horizontal centre

  // NAME / SPECIALIZATION / REG. NO, laid out as one centred stack (section 0).
  const textTags = layoutStampStack(input, W, H)
    .map((block) =>
      block.lines
        .map((line, index) => {
          const y = block.firstBaseline + index * block.lh;
          return `<text x="${cx}" y="${y}" fill="${ink}"
             text-anchor="middle"
             font-size="${block.fs.toFixed(2)}px"
             font-weight="${block.weight}"
             font-family="sans-serif">${escapeXml(line)}</text>`;
        })
        .join("\n    "),
    )
    .join("\n\n  ");

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

  <!-- Doctor name, specialization and registration number (blue ink) -->
  ${textTags}
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
  const ink = opts.ink ?? STAMP_INK_RGB;
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

  doc.setTextColor(cr, cg, cb);

  // Same stack model as the on-screen SVG, simply measured in millimetres - so
  // the printed stamp matches the preview and the PDF can never drift: name
  // bold, specialization + registration number regular.
  layoutStampStack(input, w, h).forEach((block) => {
    doc.setFont("helvetica", block.weight === "bold" ? "bold" : "normal");
    doc.setFontSize(block.fs);
    block.lines.forEach((line, index) =>
      doc.text(line, cx, y + block.firstBaseline + index * block.lh, {
        align: "center",
      }),
    );
  });

  doc.setFont("helvetica", "normal");
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
  const ink = opts.ink ?? STAMP_INK;
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

  // Same stack model as the SVG and the PDF renderers (name / specialization /
  // registration number), so all three draw an identical stamp.
  layoutStampStack(input, w, h).forEach((block) => {
    ctx.font = `${block.weight} ${block.fs}px sans-serif`;
    block.lines.forEach((line, index) =>
      ctx.fillText(line, cx, y + block.firstBaseline + index * block.lh),
    );
  });

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
