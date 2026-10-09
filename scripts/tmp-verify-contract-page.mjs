// TEMPORARY verification (delete after use): drives the real guarded
// /registerDoc/contract page with the NextAuth session API mocked, so the page
// sees exactly what it sees in the panel (the guard writes the blob to
// sessionStorage, header 9 renders, then DoctorContractPage renders).
//
// Run: node scripts/tmp-verify-contract-page.mjs   (dev server on :3111)
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3111";

const FULL_DOCTOR = {
  _id: "verify-contract-1",
  name: "Dr. Asha Menon",
  email: "asha@example.com",
  educationTraining: ["MBBS - AIIMS, 2009", "MD - Cardiology"],
  expertise: "Interventional cardiology",
  serviceOffered: ["Cardiology", "General Medicine"],
  doctorRegistrationNo: "MH-12345",
  doctorType: "Full time",
  joiningDate: "2023-04-17T00:00:00.000Z",
  price: 700,
  doctorShare: 40,
  isActive: true,
  workDays: "Monday,Tuesday,Wednesday,Thursday,Friday",
  slotStartTime: "1970-01-01T10:00:00.000Z",
  slotEndTime: "1970-01-01T17:30:00.000Z",
  language: ["English", "Hindi", "Marathi"],
  consultationType: ["Online", "Offline"],
  workExperience: "12 years",
  profilePictureUrl: "https://placehold.co/200x200?text=Photo",
  diplomasCertificatesUrls: [
    "https://placehold.co/400x300?text=MBBS",
    "https://placehold.co/400x300?text=MD",
  ],
  doctorStampUrl: "https://placehold.co/300x180?text=Stamp",
  doctorSignatureUrl: "https://placehold.co/300x120?text=Sign",
};

// Mandatory fields only - a legacy profile: no documents, no numbers.
const PRUNED_DOCTOR = {
  _id: "verify-contract-2",
  name: "Dr. Legacy",
  email: "legacy@example.com",
  doctorRegistrationNo: "GJ-1",
  isActive: false,
};

const session = (doctor) => ({
  user: doctor,
  expires: new Date(Date.now() + 86400000).toISOString(),
});

const results = [];
const check = (label, ok, detail = "") => {
  results.push({ label, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` - ${detail}` : ""}`);
};

const runCase = async (browser, doctor, { path = "/registerDoc/contract", wrap = true } = {}) => {
  const page = await browser.newPage();
  const problems = [];

  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console.error: ${message.text()}`);
  });

  await page.route("**/api/auth/session*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wrap ? session(doctor) : doctor),
    })
  );
  // The header POSTs the doctor status on mount; there is no DB here.
  await page.route("**/api/registerDoc/updateDoctorStatus*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  );

  await page.goto(`${BASE}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForTimeout(2500);

  const text = await page.locator("body").innerText();
  const flat = text.toLowerCase();
  const shot = `/tmp/${path.replace(/\W+/g, "-")}${doctor._id}.png`;
  await page.screenshot({ path: shot, fullPage: true });

  console.log(`\n=== ${path} :: ${doctor._id} :: ${doctor.name} ===`);
  check("page rendered the doctor name", text.includes(doctor.name));
  if (path === "/registerDoc/contract") {
    check("Hiring & contract card", flat.includes("hiring & contract"));
    check("Documents card", flat.includes("documents on file"));
    check("Degrees card", flat.includes("degrees & training"));
    check("Request a change CTA", flat.includes("request a change"));
  }
  check("no client-side exception", problems.length === 0, problems.join(" | "));
  console.log(`screenshot: ${shot}`);

  await page.close();
  return problems;
};

const browser = await chromium.launch();
await runCase(browser, FULL_DOCTOR);
await runCase(browser, PRUNED_DOCTOR);
// A blob written by an older build: the doctor document sits at the top level
// instead of under `user`. Both pages share the same header, so both are probed.
await runCase(browser, FULL_DOCTOR, { path: "/registerDoc/contract", wrap: false });
await runCase(browser, FULL_DOCTOR, { path: "/registerDoc/profile", wrap: false });
await runCase(browser, FULL_DOCTOR, { path: "/registerDoc/profile" });

// A session whose `user` claim exists but carries no doctor name - the other
// shape that crashed the panel header.
const runBare = async (label, body, assert) => {
  const page = await browser.newPage();
  const problems = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  await page.route("**/api/auth/session*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body })
  );
  await page.goto(`${BASE}/registerDoc/contract`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForTimeout(2500);
  const text = (await page.locator("body").innerText()).toLowerCase();
  console.log(`\n=== /registerDoc/contract :: ${label} ===`);
  assert(text, page, problems);
  await page.close();
};

await runBare(
  "doctor document without a name",
  JSON.stringify({ user: { _id: "verify-contract-3", email: "x@y.z" }, expires: "later" }),
  (text, page, problems) => {
    check("nameless session still renders the page", text.includes("hiring & contract"));
    check("nameless session: no client-side exception", problems.length === 0, problems.join(" | "));
  }
);

await runBare("signed out", "null", (text, page, problems) => {
  check(
    "signed out: bounced to the doctor login",
    page.url().includes("/registerDoc/login"),
    page.url()
  );
  check("signed out: no client-side exception", problems.length === 0, problems.join(" | "));
});

await browser.close();

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length === 0 ? 0 : 1);
