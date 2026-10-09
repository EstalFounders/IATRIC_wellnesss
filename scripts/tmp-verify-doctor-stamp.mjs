// TEMPORARY verification (delete after use): the standard doctor stamp must be
// three blue lines - Name / Specialization / Reg. No - for EVERY doctor
// profile. The Reg. No row is compulsory and prints "Reg. No: Not provided"
// while the profile has no number, so a blank value there must NOT drop the
// line - only an empty name or specialization still drops its row. Checks the
// SVG, the jsPDF vector path and the canvas path, which all share the stack
// model in lib/DoctorStampGenerator.js.
//
// Run: node scripts/tmp-verify-doctor-stamp.mjs
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const STAMP_SRC = path.join(
  ROOT,
  "src/components/registerDocComponent/lib/DoctorStampGenerator.js",
);
const HELPER_SRC = path.join(
  ROOT,
  "src/components/registerDocComponent/utils/helper.js",
);
const PREVIEW = path.join(tmpdir(), "doctor-stamp-preview.html");

const INK = "#1a56db";
const results = [];
const check = (label, ok, detail = "") => {
  results.push({ label, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}`);
};

// The module is a browser/Next ESM file, so the throwaway copy swaps its single
// import for the *real* `capitalize` implementation lifted from helper.js.
const capitalizeSrc = readFileSync(HELPER_SRC, "utf8").match(
  /export function capitalize\(name\) \{[\s\S]*?\n\}/,
);
if (!capitalizeSrc) throw new Error("capitalize(name) not found in helper.js");

const tmp = mkdtempSync(path.join(tmpdir(), "doctor-stamp-"));
const tmpModule = path.join(tmp, "DoctorStampGenerator.mjs");
writeFileSync(
  tmpModule,
  `${capitalizeSrc[0].replace("export ", "")}\n${readFileSync(STAMP_SRC, "utf8").replace(
    /^import \{ capitalize \}.*$/m,
    "// capitalize inlined above (real implementation from utils/helper.js)",
  )}`,
);

const { buildStampSvg, stampDataUrl, drawStampOnPdf, drawStampOnCanvas } =
  await import(pathToFileURL(tmpModule).href);

const textTags = (svg) => [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)];
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const FULL = {
  name: "rajesh kumar",
  specialization: "General Physician",
  regNo: "123456",
};

const cases = [
  {
    title: "full profile",
    input: FULL,
    expect: ["Dr. Rajesh Kumar", "General Physician", "Reg. No: 123456"],
  },
  {
    title: "long name + long specialization",
    input: {
      name: "bartholomew mckinley fernandes",
      specialization: "Interventional Cardiology, Diabetology",
      regNo: "DMC/2019/884213",
    },
    expect: null, // wrapping is fine, the stack only has to stay in the box
  },
  {
    title: "no registration number",
    input: { ...FULL, regNo: "" },
    // Compulsory row: the line stays, as the placeholder.
    expect: ["Dr. Rajesh Kumar", "General Physician", "Reg. No: Not provided"],
  },
  {
    title: "blank specialization",
    input: { ...FULL, specialization: "   " },
    expect: ["Dr. Rajesh Kumar", "Reg. No: 123456"],
    // The placeholder must only appear when the number itself is missing.
    absent: "Reg. No: Not provided",
  },
  {
    title: "name only",
    input: { name: "Rajesh Kumar", specialization: "", regNo: "" },
    expect: ["Dr. Rajesh Kumar", "Reg. No: Not provided"],
  },
  {
    title: "name with & and <",
    input: { name: "rao & sons <clinic>", specialization: "ENT", regNo: "42" },
    // The long name wraps over two lines, so this stamp is four lines wide.
    expect: ["Dr. Rao &amp; Sons", "&lt;clinic&gt;", "ENT", "Reg. No: 42"],
  },
  {
    title: "legacy dmcNo alias",
    input: { name: "rajesh kumar", specialization: "ENT", dmcNo: "777" },
    expect: ["Dr. Rajesh Kumar", "ENT", "Reg. No: 777"],
  },
];

// ── SVG: one line per field, all blue, inside the 300 x 180 viewBox ─────────
const previews = [];
for (const testCase of cases) {
  const svg = buildStampSvg(testCase.input);
  const tags = textTags(svg);
  const lines = tags.map(([, text]) => text);
  const fills = tags.map(([tag]) => attr(tag, "fill"));
  const sizes = tags.map(([tag]) => Number(attr(tag, "font-size").replace("px", "")));
  const weights = tags.map(([tag]) => attr(tag, "font-weight"));

  if (testCase.expect) {
    check(
      `${testCase.title}: prints ${testCase.expect.length} line(s)`,
      lines.length === testCase.expect.length,
      lines.join(" | "),
    );
    testCase.expect.forEach((text, index) =>
      check(
        `${testCase.title}: line ${index + 1} = "${text}"`,
        (lines[index] || "").includes(text),
      ),
    );
  } else {
    check(
      `${testCase.title}: all ${lines.length} lines stay inside 0..180px`,
      tags.every(([tag]) => Number(attr(tag, "y")) > 0 && Number(attr(tag, "y")) <= 180),
      lines.join(" | "),
    );
    check(
      `${testCase.title}: font stays >= 15px and shrinks below the 27px max`,
      sizes.every((fs) => fs >= 14.9) && sizes[0] <= 27 && sizes[0] > 15,
      sizes.map((s) => s.toFixed(2)).join(","),
    );
    check(
      `${testCase.title}: no line reaches the bottom border`,
      tags.every(
        ([tag]) =>
          Number(attr(tag, "y")) + Number(attr(tag, "font-size").replace("px", "")) <=
          180,
      ),
      tags.map(([tag]) => attr(tag, "y")).join(","),
    );
  }

  if (testCase.absent !== undefined) {
    check(
      `${testCase.title}: no placeholder line`,
      !lines.some((line) => line.trim() === testCase.absent),
    );
  }
  check(
    `${testCase.title}: every line is blue (${INK})`,
    fills.length > 0 && fills.every((fill) => fill === INK),
    fills.join(","),
  );
  check(`${testCase.title}: name is bold`, weights[0] === "bold", weights.join(","));
  check(
    `${testCase.title}: data-URL is valid`,
    stampDataUrl(testCase.input).startsWith("data:image/svg+xml;base64,"),
  );

  previews.push({ title: testCase.title, svg, lines });
}

// ── jsPDF path: the same three lines, measured in millimetres (45 x 27 mm) ──
const calls = [];
const pdfDoc = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === "text") return (text, x, y, opts) => calls.push({ text, x, y, opts });
      if (prop === "setFont") return (...args) => calls.push({ setFont: args });
      if (prop === "setFontSize") return (size) => calls.push({ fontSize: size });
      return () => {};
    },
  },
);
drawStampOnPdf(pdfDoc, FULL, 150, 248, 45, 27);
const pdfText = calls.filter((call) => call.text);
const pdfSizes = calls.filter((call) => call.fontSize).map((call) => call.fontSize);
const pdfFonts = calls.filter((call) => call.setFont).map((call) => call.setFont[1]);

check("PDF: three text calls", pdfText.length === 3, pdfText.map((c) => c.text).join(" | "));
check(
  "PDF: lines centred in the 45x27mm box",
  pdfText.every((call) => call.x === 172.5 && call.y > 248 && call.y < 275),
  pdfText.map((call) => call.y.toFixed(2)).join(","),
);
check(
  "PDF: font sizes 2mm-5mm, descending",
  pdfSizes.length === 3 &&
    pdfSizes[0] > pdfSizes[1] &&
    pdfSizes[1] >= pdfSizes[2] &&
    pdfSizes[2] > 2 &&
    pdfSizes[0] < 5,
  pdfSizes.map((s) => s.toFixed(2)).join(","),
);
check(
  "PDF: name bold, rest regular, font reset at the end",
  pdfFonts[0] === "bold" && pdfFonts.at(-1) === "normal",
  pdfFonts.join(","),
);
check(
  "PDF: the three lines match the SVG exactly",
  pdfText.map((c) => c.text).join("|") ===
    textTags(buildStampSvg(FULL)).map(([, text]) => text).join("|"),
  pdfText.map((c) => c.text).join("|"),
);

// ── Canvas path: one fillText per line, blue ink, horizontally centred ──────
const draws = [];
const ctx = {
  save() {},
  restore() {},
  beginPath() {},
  roundRect() {},
  stroke() {},
  set strokeStyle(value) {
    draws.push({ strokeStyle: value });
  },
  set fillStyle(value) {
    draws.push({ fillStyle: value });
  },
  set lineWidth(value) {},
  set font(value) {
    draws.push({ font: value });
  },
  set textAlign(value) {
    draws.push({ textAlign: value });
  },
  fillText(text, x, y) {
    draws.push({ text, x, y });
  },
};
drawStampOnCanvas(ctx, FULL, 0, 0, 300, 180);
const canvasText = draws.filter((call) => call.text);
check(
  "Canvas: three centred blue lines",
  canvasText.length === 3 &&
    canvasText.every((call) => call.x === 150) &&
    draws.some((call) => call.strokeStyle === INK),
  canvasText.map((call) => call.text).join(" | "),
);
check(
  "Canvas: fonts mirror the SVG weights",
  draws
    .filter((call) => call.font)
    .map((call) => call.font.split(" ")[0])
    .join(",") === "bold,600,normal",
  draws.filter((call) => call.font).map((call) => call.font).join(" | "),
);

rmSync(tmp, { recursive: true, force: true });

writeFileSync(
  PREVIEW,
  `<!doctype html><meta charset="utf-8"><title>Doctor stamp preview</title>
<body style="font:14px sans-serif;background:#f4f5f7;padding:24px">
<h1 style="font-size:18px">Standard doctor stamp - Name / Specialization / Reg. No</h1>
${previews
  .map(
    ({ title, svg, lines }) =>
      `<section style="margin-bottom:28px"><h2 style="font-size:14px">${title}</h2>
       <div style="background:#fff;padding:12px;display:inline-block">${svg}</div>
       <p>${lines.map((line) => `<code>${line}</code>`).join(" &nbsp;|&nbsp; ")}</p></section>`,
  )
  .join("\n")}
</body>`,
);
console.log(`\nHTML preview: ${PREVIEW}`);

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log(failed.map((result) => `- ${result.label} ${result.detail}`).join("\n"));
  process.exitCode = 1;
}
