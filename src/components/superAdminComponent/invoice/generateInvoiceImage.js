import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";
import {
  api,
  company_registrated_name,
  invoice_bill_yellow_color,
} from "../../../constant";
import Preloader from "../../Preloader";
import { sendInvoiceToFirebase } from "../../../utils";
import { priceToWords } from "../utility/helper";

const GenerateInvoiceImage = ({ request, onClose }) => {
  console.log("request", request);
  const data = request[0];
  const [loader, setLoader] = useState(false);

  const date = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const {
    name,
    mobNo,
    address,
    invoiceNumber,
    subTotal,
    totalPrice,
    gst,
    freight,
    tax,
    item,
  } = data;
  // const {}
  console.log(data, "data");

  const generatePDF = async () => {
    setLoader(true);

    try {
      const invoiceElement = document.getElementById("invoiceContainer");

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const blob = doc.output("blob");
      const invoiceUrl = await sendInvoiceToFirebase(blob, invoiceNumber);

      const payload = {
        data: {
          ...data,
          invoiceUrl: invoiceUrl,
        },
      };
      const response = await fetch(api.uploadInvoice, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.alert("Invoice sent.");
      } else {
        console.error("Error uploading pdf:", response.statusText);
        window.alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      window.alert("Error generating PDF. Please try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div>
      {/* Scrollable preview shell — does NOT wrap invoiceContainer so html2canvas captures full height */}
      <div style={{ overflow: "auto",
         maxHeight: "75vh", border: "1px solid #dee2e6", 
         borderRadius: "4px", 
          }}>
      <div
        id="invoiceContainer"
        className="bg-white"
        style={{
          minWidth: "900px",
          width: "100%",
          padding: "32px 40px",
        }}
      >
        <div className="row">
          <div className="col-md-8">
            <h3 className="text-uppercase">{company_registrated_name}</h3>
            <h1 className="display-3">INVOICE</h1>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-center">
            <img
              src="/images/invoicelogo.png"
              alt="Logo"
              height={150}
              width={150}
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
              <b>Address:</b> {address}
            </div>
            <div className="h6">
              <b>Contact:</b> {mobNo}
            </div>
          </div>
          <div className="col-md-4">
            <h4>FROM:</h4>
            <div>
              HEALTHPATH F-33 RIGROSS COMPLEX C,BLOCK SECTOR 57 GURGAON ,HARYANA
              CONTACT : +91 84485 59925 GSTIN : XXXXXXXXXXXXXX
            </div>
          </div>
          <div className="col-md-4 text-md-end">
            <div>
              <b>Invoice No:</b> {invoiceNumber}
            </div>
            <div>
              <b>Date:</b> {date}
            </div>
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
              {item.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.hsn}</td>
                  <td>{item.qty}</td>
                  <td>{item.discount}</td>
                  <td>₹ {item.price}</td>
                  <td>₹ {item.totalPrice}</td>
                </tr>
              ))}
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
              <b className="col">Discount:</b>
              <div className="col">₹ {0}</div>
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
            <div className="mb-0 text-center">TTANSHE HEALTH PATH PVT. LTD</div>
          </div>
          <div className="col-md-6 text-right text-black font-weight-bold">
            <div className="mb-0">Contact: +91 84485 59925</div>
            <div className="mb-0">www.healthpath.co.in</div>
            <div>customercare@healthpath.co.in</div>
          </div>
        </div>
      </div>
      </div>

      {/* Buttons — fixed at bottom center, independent of invoice width */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
          display: "flex",
          gap: "16px",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() => generatePDF()}
        >
          Generate & Send
        </button>

        <button
          className="btn btn-primary"
          onClick={() => onClose()}
        >
          Close
        </button>
      </div>

      {loader && <Preloader />}
    </div>
  );
};
export default GenerateInvoiceImage;
