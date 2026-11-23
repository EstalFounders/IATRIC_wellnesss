// Browser-only: turns the invoice preview markup into a PDF blob.
//
// Same approach as the doctor prescription generator
// (src/components/registerDocComponent/lib/DoctorPrescriptionGenerator.js):
// html2canvas captures the live DOM, jsPDF slices it into A4 pages. Callers
// upload the blob with `sendInvoiceToFirebase` (src/utils.js) and store only
// the resulting Firebase URL on the invoice.
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/** Resolves once every <img> inside `element` has loaded (or failed). */
const waitForImages = (element) =>
  Promise.all(
    [...element.querySelectorAll("img")].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }),
    ),
  );

/**
 * Renders the invoice preview element to an A4 PDF.
 *
 * @param {HTMLElement} element  the node with id="invoiceContainer"
 * @returns {Promise<Blob>} application/pdf blob
 */
export const createInvoicePdfBlob = async (element) => {
  if (!element) throw new Error("Invoice preview is not ready");

  // A slow logo must never be captured blank.
  await waitForImages(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    // The preview is 900px wide inside a scroll container; match the clone's
    // viewport to the element so a narrow admin window cannot clip it.
    windowWidth: Math.max(element.scrollWidth, element.clientWidth),
    windowHeight: Math.max(element.scrollHeight, element.clientHeight),
    scrollY: -window.scrollY,
  });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;

  if (imageHeight <= pageHeight) {
    doc.addImage(
      canvas.toDataURL("image/jpeg", 0.95),
      "JPEG",
      0,
      0,
      pageWidth,
      imageHeight,
    );
    return doc.output("blob");
  }

  // Tall invoice: one page per A4-height strip of the captured canvas.
  const pixelsPerMm = canvas.width / pageWidth;
  const sliceHeight = Math.floor(pageHeight * pixelsPerMm);
  let offset = 0;
  let page = 0;

  while (offset < canvas.height) {
    const height = Math.min(sliceHeight, canvas.height - offset);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = height;
    const context = slice.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, slice.width, slice.height);
    context.drawImage(
      canvas,
      0,
      offset,
      canvas.width,
      height,
      0,
      0,
      canvas.width,
      height,
    );

    if (page > 0) doc.addPage();
    doc.addImage(
      slice.toDataURL("image/jpeg", 0.95),
      "JPEG",
      0,
      0,
      pageWidth,
      (height * pageWidth) / slice.width,
    );

    offset += height;
    page += 1;
  }

  return doc.output("blob");
};

export default createInvoicePdfBlob;
