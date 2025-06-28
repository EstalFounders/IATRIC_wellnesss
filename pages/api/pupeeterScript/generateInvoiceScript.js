// const puppeteer = require("puppeteer");

// export async function triggerInvoiceCapture(billingServices) {
//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: ["--no-sandbox"],
//   });
//   const page = await browser.newPage();

//   await page.goto(`http://localhost:3000/genrateInvoiceImage?data=${billingServices}`, {
//     waitUntil: "networkidle2",
//   });

//   // Optional: wait longer to be sure image was generated
//   await new Promise((r) => setTimeout(r, 3000));

//   await browser.close();
// }
