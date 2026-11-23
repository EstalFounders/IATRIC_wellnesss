import { useRef, useState } from "react";
import Image from "next/image";
import {
  api,
  company_registrated_name,
  contact_no,
  gst_no,
  invoice_bill_yellow_color,
  invoice_status,
} from "../../../constant";
import { sendInvoiceToFirebase } from "../../../utils";
import { createInvoicePdfBlob } from "../../../lib/invoice/invoicePdf";
import { priceToWords } from "../utility/helper";

/** True for a Firebase Storage download URL (the generated invoice PDF). */
const isFirebaseDocumentUrl = (value) =>
  /^https:\/\/firebasestorage\.googleapis\.com\//i.test(String(value || ""));

// Invoice preview + "Send Invoice".
//
// The PDF is generated in the browser (html2canvas + jsPDF, see
// src/lib/invoice/invoicePdf.js), uploaded to Firebase Storage
// (`sendInvoiceToFirebase`) and only the Firebase download URL is stored on the
// invoice row (POST /api/helper/invoices { id, invoiceUrl }). That URL is what
// the patient receives on WhatsApp.
//
// If rendering/uploading the PDF fails, the POST still happens WITHOUT
// `invoiceUrl`, so the API falls back to the read-only invoice page
// (/api/invoice/<id>) - a WhatsApp send must never be blocked by the document.
// Only COMPLETED invoices can be sent.
const InvoicePreview = ({ invoice, onClose, onSent }) => {
  const {
    name,
    address,
    mobNo,
    invoiceNumber,
    billFrom,
    subTotal,
    totalPrice,
    gst,
    freight,
    tax,
    item = [],
    status,
  } = invoice;

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  // The invoice sheet that is rasterised into the PDF (id kept for parity with
  // the prescription generator's #pdfContainer convention).
  const invoiceRef = useRef(null);
  // Firebase-hosted document, if the row already has one. Anything else (the
  // read-only /api/invoice/<id> page, an old localhost link) keeps the "Open
  // invoice page" fallback instead of being labelled a PDF.
  const [documentUrl, setDocumentUrl] = useState(
    isFirebaseDocumentUrl(invoice.invoiceUrl) ? invoice.invoiceUrl : "",
  );

  const canSend = status === invoice_status.completed;

  const date = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const invoiceLink = `/api/invoice/${invoice._id}`;

  const handleGenerateAndSend = async () => {
    if (!canSend || sending) return;
    setSending(true);
    setSendError("");

    // 1. Render + upload the PDF. Best effort: on failure we send the invoice
    //    page instead of aborting the WhatsApp message.
    let firebaseUrl = "";
    try {
      const blob = await createInvoicePdfBlob(invoiceRef.current);
      firebaseUrl = await sendInvoiceToFirebase(blob, {
        invoiceNumber,
        patientName: name,
      });
    } catch (error) {
      console.error("Invoice PDF upload failed, using the invoice page:", error);
    }

    // 2. Store the URL + WhatsApp it (server-side, same path as the cron).
    try {
      const response = await fetch(api.getInvoices, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoice._id, invoiceUrl: firebaseUrl }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || "Could not send the invoice",
        );
      }

      if (isFirebaseDocumentUrl(data.invoice?.invoiceUrl)) {
        setDocumentUrl(data.invoice.invoiceUrl);
      }
      if (onSent) onSent(data.invoice, data.whatsapp);
    } catch (error) {
      console.error("Invoice send error:", error);
      setSendError(error.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div
        style={{
          overflow: "auto",
          maxHeight: "75vh",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
        }}
      >
        <div
          id="invoiceContainer"
          ref={invoiceRef}
          className="bg-white"
          style={{ minWidth: "900px", width: "100%", padding: "32px 40px" }}
        >
          <div className="row">
            <div className="col-md-8">
              <h3 className="text-uppercase">{company_registrated_name}</h3>
              <h1 className="display-3">INVOICE</h1>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-center">
              <Image
                src="/images/invoicelogo.png"
                alt="Logo"
                width={400}
                height={300}
                priority={false}
                loading="lazy"
              />
            </div>
          </div>

          {/* Address Blocks */}
          <div className="row mb-4">
            <div className="col-md-4">
              <h4>BILL TO:</h4>
              <div className="h6">
                <b>Name:</b> {name}
              </div>
              <div className="h6">
                <b>Address:</b> {address || "-"}
              </div>
              <div className="h6">
                <b>Contact:</b> {mobNo}
              </div>
            </div>
            <div className="col-md-4">
              <h4>FROM:</h4>
              <div className="h6 font-weight-bold">
                {billFrom || company_registrated_name}
              </div>
              <div>
                HEALTHPATH RIGROSS COMPLEX C,BLOCK SECTOR 57 GURGAON
                ,HARYANA CONTACT : {contact_no}
                <div>GSTIN : {gst_no}</div>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <div>
                <b>Invoice No:</b> {invoiceNumber}
              </div>
              <div>
                <b>Date:</b> {date}
              </div>
              {status ? (
                <div>
                  <b>Status:</b> {status}
                </div>
              ) : null}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <table className="table table-bordered text-center align-middle">
              <thead
                className="table-light"
                style={{ backgroundColor: `${invoice_bill_yellow_color}` }}
              >
                <tr>
                  <th>S.NO.</th>
                  <th>Description</th>
                  <th>HSN</th>
                  <th>QTY</th>
                  <th>DISCOUNT</th>
                  <th>PRICE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {item.map((line, idx) => {
                  // Stored invoices only keep price/discount/quantity (the item
                  // schema has no totalPrice), so derive the line total.
                  const quantity = Number(line.quantity ?? line.qty ?? 1);
                  const lineTotal =
                    line.totalPrice ??
                    Number(line.price || 0) * quantity -
                      Number(line.discount || 0);

                  return (
                    <tr key={line.id || idx}>
                      <td>{idx + 1}</td>
                      <td>{line.name}</td>
                      <td>{line.hsn}</td>
                      <td>{quantity}</td>
                      <td>{line.discount}</td>
                      <td>₹ {line.price}</td>
                      <td>₹ {lineTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="row mb-4">
            <div className="col-md-6 text-end"></div>
            <div className="col-md-6 text-right">
              <div className="row">
                <b className="col">Subtotal:</b>
                <div className="col">₹ {subTotal}</div>
              </div>
              <div className="row">
                <b className="col">GST:</b>
                <div className="col">₹ {gst}</div>
              </div>
              <div className="row">
                <b className="col">Freight:</b>
                <div className="col">₹ {freight}</div>
              </div>
              <div className="row">
                <b className="col">Tax:</b>
                <div className="col">₹ {tax}</div>
              </div>
              <hr style={{ borderWidth: "2.2px", backgroundColor: "#000000" }} />
              <div className="row h5">
                <b className="col">TOTAL:</b>
                <div className="col">₹ {totalPrice}</div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-4 d-flex flex-row">
            <div className="font-weight-bold">TOTAL IN WORDS:</div>
            <div className="ml-3 text-uppercase">{priceToWords(totalPrice)}</div>
          </div>
          <div>
            <hr />
            <div className="font-weight-bold small">TERMS & CONDITIONS:</div>
            <ol style={{ listStyleType: "disc" }} className="small">
              <li>
                INTEREST 18% P.A. WILL BE CHARGED IF PAYMENT IS NOT MADE WITHIN
                STIPULATED TIME.
              </li>
              <li>ALL DISPUTES SUBJECTED TO GURGAON JURISDICTION ONLY.</li>
              <li>
                THIS IS A COMPUTER GENERATED INVOICE. NO SIGNATURE REQUIRED.
              </li>
              <li>
                FREE FOLLOW-UP IS AVAILABLE ONLY WITHIN 48 HOURS OF THE
                CONSULTATION AND ONLY FOR THE SAME OR A RELATED PROBLEM.
              </li>
            </ol>
            <hr />
          </div>

          {/* Footer */}
          <div
            className="row text-center border-top p-3"
            style={{ backgroundColor: `${invoice_bill_yellow_color}` }}
          >
            <div className="col-md-6 text-left">
              <div className="mb-1 text-center h2 font-weight-bold">
                Thank you!
              </div>
              <div className="mb-0 text-center">
                TTANSHE HEALTH PATH PVT. LTD
              </div>
            </div>
            <div className="col-md-6 text-right text-black font-weight-bold">
              {/* Customer-facing invoice - prints the customer-support number. */}
              <div className="mb-0">Contact: {contact_no}</div>
              <div className="mb-0">www.healthpath.co.in</div>
              <div>customercare@healthpath.co.in</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions — fixed at bottom center, independent of invoice width */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            className="btn btn-success"
            type="button"
            onClick={handleGenerateAndSend}
            disabled={!canSend || sending}
            title={
              canSend
                ? "Generate the invoice PDF, store it in Firebase and WhatsApp the link"
                : "Only COMPLETED invoices can be sent"
            }
          >
            {sending ? "Sending..." : "Send Invoice"}
          </button>

          <a
            className="btn btn-primary"
            href={documentUrl || invoiceLink}
            target="_blank"
            rel="noopener noreferrer"
            title={
              documentUrl
                ? "Stored invoice document (Firebase)"
                : "Read-only invoice page - used until a PDF is stored"
            }
          >
            {documentUrl ? "Open invoice PDF" : "Open invoice page"}
          </a>

          <button
            className="btn btn-primary"
            type="button"
            onClick={() => onClose()}
          >
            Close
          </button>
        </div>

        {!canSend ? (
          <div className="small" style={{ color: "#664d03", fontWeight: 600 }}>
            Only COMPLETED invoices can be sent. Change the status from the
            invoice list first.
          </div>
        ) : null}
        {sendError ? (
          <div className="small" style={{ color: "#842029", fontWeight: 600 }}>
            {sendError}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InvoicePreview;
