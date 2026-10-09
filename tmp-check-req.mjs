// TEMP verification script #2 - confirm-modal wiring + warning check.
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/__devDoctorUpdateReqPreview";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

const problems = [];
page.on("pageerror", (error) => problems.push(`pageerror: ${error}`));
page.on("console", (message) => {
  if (message.type() === "error") {
    problems.push(`console: ${message.text().slice(0, 220)}`);
  }
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector("article");
console.log("cards:", await page.locator("article").count());

// The confirm dialog must open with the approval copy and a green confirm button,
// and cancelling must leave the request pending (no PUT sent).
await page.locator("article button", { hasText: "Approve" }).first().click();
await page.waitForSelector("text=Approve this change request?");
console.log("confirmCopy:", await page.locator('[role="dialog"]').innerText());
console.log(
  "greenConfirmButtons:",
  await page.locator('[role="dialog"] .btn-success').count()
);
await page.screenshot({ path: "/tmp/req-confirm.png" });
await page.locator('[role="dialog"] button', { hasText: "Cancel" }).click();
await page.waitForTimeout(250);
console.log(
  "stillPendingAfterCancel:",
  (await page.locator("article").first().innerText()).includes("PENDING")
);

// Same dialog, destructive wording, for reject.
await page.locator("article button", { hasText: "Reject" }).first().click();
await page.waitForSelector("text=Reject this change request?");
console.log("rejectCopy:", await page.locator('[role="dialog"]').innerText());
await page.locator('[role="dialog"] button', { hasText: "Cancel" }).click();
await page.waitForTimeout(250);

await page.screenshot({ path: "/tmp/req-page.png", fullPage: true });
console.log("problems:", JSON.stringify(problems, null, 1));

await browser.close();
