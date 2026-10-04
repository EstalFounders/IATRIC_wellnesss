// Temporary verification for /about-us: renders the real page in Chromium and
// reports the things the SEO rewrite was supposed to guarantee (single H1,
// valid list nesting, internal links, JSON-LD, no overflow, HI parity).
// Run with a dev server up:  node scripts/tmp-verify-about-page.mjs
import { chromium } from "playwright";

const BASE = process.env.ABOUT_URL || "http://localhost:3123/about-us";

const CASES = [
  { label: "desktop 1440 (en)", viewport: { width: 1440, height: 900 } },
  { label: "mobile 390 (en)", viewport: { width: 390, height: 844 } },
  { label: "desktop 1440 (hi)", viewport: { width: 1440, height: 900 }, lang: "hi" },
];

const browser = await chromium.launch();

for (const testCase of CASES) {
  const context = await browser.newContext({ viewport: testCase.viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text().slice(0, 160));
  });
  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));

  if (testCase.lang) {
    await page.addInitScript(
      (lang) => window.localStorage.setItem("app_lang", lang),
      testCase.lang
    );
  }

  await page.goto(BASE, { waitUntil: "commit" });
  await page.waitForSelector("#info-4 h1", { timeout: 60000 });
  await page.waitForTimeout(1200);

  const data = await page.evaluate(() => {
    const info4 = document.querySelector("#info-4");
    const txt = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
    const ldScripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
    return {
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll("h1").length,
      h1: [...document.querySelectorAll("h1")].map(txt),
      info4Headings: info4
        ? [...info4.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
            (h) => `${h.tagName}: ${txt(h).slice(0, 70)}`
          )
        : null,
      info4EyebrowTags: info4
        ? [...info4.querySelectorAll(".about-eyebrow")].map((e) => e.tagName)
        : null,
      info4Bullets: info4
        ? [...info4.querySelectorAll(".bottom-row ul li")].map((li) => txt(li).slice(0, 70))
        : null,
      info4BulletLists: info4 ? info4.querySelectorAll(".bottom-row ul").length : null,
      info4Links: info4
        ? [...info4.querySelectorAll(".about-links a")].map(
            (a) => `${a.getAttribute("href")} | ${txt(a)}`
          )
        : null,
      videoHeading: txt(document.querySelector("#info-1 h2")),
      videoEyebrowTag: document.querySelector("#info-1 .about-eyebrow")?.tagName,
      steps: [...document.querySelectorAll("#info-1 ol li")].map((li) => txt(li).slice(0, 80)),
      badNesting: [...document.querySelectorAll("p ul, p ol, p div")].map((n) => n.tagName),
      ld: ldScripts.flatMap((s) => {
        try {
          const parsed = JSON.parse(s.textContent);
          return (parsed["@graph"] || [parsed]).map((n) => n["@type"]);
        } catch (err) {
          return ["PARSE ERROR: " + err.message];
        }
      }),
      ldId: ldScripts.map((s) => s.id),
      images: [...document.querySelectorAll("#info-1 img, #info-4 img")].map((i) => ({
        src: i.getAttribute("src")?.slice(0, 40),
        alt: i.getAttribute("alt"),
      })),
      overflow:
        document.documentElement.scrollWidth - window.innerWidth > 1
          ? `${document.documentElement.scrollWidth} > ${window.innerWidth}`
          : "none",
      // Visual parity with the old (h3.h3-md / p.p-sm) markup, checked because
      // several template classes are element-qualified and silently stop
      // matching once the same look is used on an h1/h2/li.
      styles: (() => {
        const cs = (sel, props) => {
          const el = document.querySelector(sel);
          if (!el) return `${sel} MISSING`;
          const computed = getComputedStyle(el);
          return `${sel}: ${props.map((p) => computed[p]).join(" / ")}`;
        };
        return [
          cs("#info-4 h1", ["fontSize", "marginBottom", "color"]),
          cs("#info-4 .bottom-row h2", ["fontSize", "marginBottom", "color"]),
          cs("#info-4 p.about-eyebrow", ["fontSize", "marginBottom"]),
          cs("#info-4 .bottom-row li.p-sm", ["fontSize"]),
          cs("#info-4 .about-links a", ["fontSize", "color"]),
          cs("#info-1 h2", ["fontSize", "color"]),
          cs("#info-1 p.about-eyebrow", ["fontSize", "marginBottom"]),
          cs("#info-1 ol li", ["fontSize"]),
        ];
      })(),
      info4Words: info4 ? txt(info4).split(/\s+/).length : null,
      info1Words: document.querySelector("#info-1")
        ? txt(document.querySelector("#info-1")).split(/\s+/).length
        : null,
    };
  });

  console.log(`\n=== ${testCase.label} ===`);
  console.log(JSON.stringify(data, null, 1));
  console.log("console errors:", errors.length ? errors.slice(0, 4) : "none");
  await context.close();
}

await browser.close();
