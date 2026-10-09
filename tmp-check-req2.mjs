// TEMP verification script #3 - final look at the page and the review modal.
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const problems = [];
page.on("pageerror", (error) => problems.push(`pageerror: ${error}`));
page.on("console", (message) => {
  if (message.type() === "error") {
    problems.push(`console: ${message.text().slice(0, 160)}`);
  }
});

await page.goto("http://localhost:3000/__devDoctorUpdateReqPreview", {
  waitUntil: "networkidle",
});
await page.waitForSelector("article");
await page.screenshot({ path: "/tmp/req-page.png", fullPage: true });

await page.locator("article button", { hasText: "Review" }).first().click();
await page.waitForSelector("table");
await page.screenshot({ path: "/tmp/req-modal.png" });
console.log("modalOk:", (await page.locator("table").innerText()).includes("Requested"));

// Search box narrows the list without touching the API.
await page.keyboard.press("Escape");
await page.locator('input[type="search"]').fill("zzz-nothing");
await page.waitForTimeout(200);
console.log("emptySearch:", await page.locator('[role="status"]').innerText());
await page.locator('input[type="search"]').fill("ashima");
await page.waitForTimeout(200);
console.log("searchHits:", await page.locator("article").count());

console.log("problems:", JSON.stringify(problems, null, 1));
await browser.close();
