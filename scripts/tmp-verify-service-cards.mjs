// TEMPORARY verification (delete after use): Home Care (8 services) and
// Nursing Care (6 procedures) must render as icon cards, not tabs.
import { chromium } from "@playwright/test";

const base = "http://localhost:3100";
// Same green as color_schema.green in src/constant.js - the icon badge border.
const EXPECTED_BORDER = "rgb(59, 95, 29)";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 1100 } });

const readCards = async (url, shot) => {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForSelector(".MuiCard-root", { timeout: 90000 });
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".MuiCard-root")].map((c) => {
      const badge = [...c.querySelectorAll("div")].find((d) => {
        const s = getComputedStyle(d);
        return s.borderRadius.startsWith("50%") || s.borderRadius === "9999px";
      });
      const bs = badge ? getComputedStyle(badge) : null;
      return {
        name: c.querySelector("h6")?.textContent.trim(),
        description: (c.querySelector("p")?.textContent || "").trim().slice(0, 60),
        iconSvgInBadge: !!badge?.querySelector("svg"),
        badgeBorder: bs ? `${bs.borderTopWidth} ${bs.borderTopColor}` : null,
        badgeBg: bs ? bs.backgroundColor : null,
        image: !!c.querySelector("img"),
        button: c.querySelector("button")?.textContent.trim(),
      };
    });
    return {
      h1: document.querySelector("h1")?.textContent.trim(),
      h2: [...document.querySelectorAll("h2")].map((h) => h.textContent.trim()),
      tabCount: document.querySelectorAll('[role="tab"]').length,
      cards,
    };
  });
  await page.screenshot({ path: shot, fullPage: true });
  return data;
};

const home = await readCards(
  `${base}/service-details?name=${encodeURIComponent("Home Care")}&Service=home-care`,
  "/tmp/hp-home-care.png"
);
const nursing = await readCards(
  `${base}/service-details?name=${encodeURIComponent(
    "Nursing Care"
  )}&Service=nursing-services`,
  "/tmp/hp-nursing-care.png"
);

const nursingText = nursing.cards
  .map((c) => `${c.name} ${c.description}`)
  .join(" ")
  .toLowerCase();
const leaked = [
  "gda",
  "general duty assistant",
  "attendant",
  "physiotherap",
  "medicine delivery",
  "equipment",
  "lab sample",
  "lab test",
  "phlebotomist",
].filter((term) => nursingText.includes(term));

const iconProblems = [
  ...home.cards.map((c) => ["home", c]),
  ...nursing.cards.map((c) => ["nursing", c]),
]
  .filter(
    ([, c]) =>
      !c.iconSvgInBadge || c.badgeBorder !== `1px ${EXPECTED_BORDER}`
  )
  .map(([pageName, c]) => `${pageName}: ${c.name} -> ${c.badgeBorder}`);

console.log(
  JSON.stringify(
    {
      home,
      nursing,
      expectedBadgeBorder: `1px ${EXPECTED_BORDER}`,
      iconProblems,
      nursingLeakage: leaked,
    },
    null,
    1
  )
);

await browser.close();
