// TEMPORARY image-load check (delete after use).
import { chromium } from "@playwright/test";

const url = `http://localhost:3100/service-details?name=${encodeURIComponent(
  "Nursing Care"
)}&Service=nursing-services`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const seen = [];
page.on("request", (r) => {
  if (r.url().includes("/_next/image")) seen.push(["req", decodeURIComponent(r.url()).slice(0, 90)]);
});
page.on("requestfailed", (r) =>
  seen.push(["FAIL", decodeURIComponent(r.url()).slice(0, 90), r.failure()?.errorText])
);
page.on("response", async (r) => {
  if (r.url().includes("/_next/image"))
    seen.push(["res", decodeURIComponent(r.url()).slice(0, 90), r.status()]);
});

await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForSelector("h1");
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 250));
  }
});
await page.locator(".MuiCard-root img").last().scrollIntoViewIfNeeded();
await page.waitForTimeout(3000);
// Chromium defers lazy images while other requests are in flight, so force it.
await page.evaluate(() => {
  const nodes = document.querySelectorAll(".MuiCard-root img");
  const last = nodes[nodes.length - 1];
  last.loading = "eager";
  last.scrollIntoView();
});
await page.waitForTimeout(6000);

const last = await page.$$eval(".MuiCard-root img", (nodes) => {
  const n = nodes[nodes.length - 1];
  const r = n.getBoundingClientRect();
  return {
    alt: n.getAttribute("alt"),
    loading: n.getAttribute("loading"),
    complete: n.complete,
    naturalWidth: n.naturalWidth,
    src: n.getAttribute("src"),
    srcset: (n.getAttribute("srcset") || "").slice(0, 120),
    rect: { top: Math.round(r.top), h: Math.round(r.height) },
  };
});
console.log("last image:", JSON.stringify(last, null, 1));

// hard-fetch the exact optimizer URL the browser would use
const forced = await page.evaluate(async () => {
  const nodes = document.querySelectorAll(".MuiCard-root img");
  const n = nodes[nodes.length - 1];
  const target = n.getAttribute("srcset").split(",")[0].trim().split(" ")[0];
  n.removeAttribute("loading");
  n.removeAttribute("srcset");
  n.src = target;
  return await new Promise((resolve) => {
    n.onload = () => resolve({ target, ok: true, w: n.naturalWidth });
    n.onerror = () => resolve({ target, ok: false });
    setTimeout(() => resolve({ target, ok: "timeout", w: n.naturalWidth }), 10000);
  });
});
console.log("forced fetch:", JSON.stringify(forced));
console.log("network:", JSON.stringify(seen.filter((s) => s[0] !== "req"), null, 1));
await browser.close();
