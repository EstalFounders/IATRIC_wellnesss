import Image from "next/image";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";

import { useEffect, useImperativeHandle, useState } from "react";
import {
  api,
  company_registrated_name,
  invoice_bill_yellow_color,
} from "../../../constant";
import Preloader from "../../Preloader";
import { styles } from "../css/GenerateInvoiceImage.module.css";

const GenerateInvoiceImage = ({ request, onClose, ref }) => {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("data");
  const data = request;
  const [loader, setLoader] = useState(false);


  const date = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const {
    name,
    mobNo,
    invoiceNumber,
    subTotal,
    totalPrice,
    gst,
    discount,
    freight,
    tax,
    item,
  } = data;
  // const {}

  const invoiceData = {
    name: name,
    mobNo: mobNo,
    invoiceNo: invoiceNumber,
    date: date,
    items: item,
    subtotal: subTotal,
    gst: gst,
    discount: discount,
    freight: freight,
    tax: tax,
    total: totalPrice,
  };

  const generatePDF = async () => {
    setLoader(true);

    // Get the invoice container element
    const element = document.getElementById("invoiceContainer");

    // Store original styles
    const originalStyles = {
      overflow: element.style.overflow,
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      height: element.style.height,
      width: element.style.width,
    };

    // Calculate required dimensions
    const scrollHeight = element.scrollHeight;
    const scrollWidth = element.scrollWidth;

    try {
      // Apply temporary styles individually
      element.style.overflow = "visible";
      element.style.position = "absolute";
      element.style.left = "0";
      element.style.top = "0";
      element.style.height = `${scrollHeight}px`;
      element.style.width = `${scrollWidth}px`;

      // Capture full content
      const canvas = await html2canvas(element, {
        scrollX: 0,
        scrollY: 0,
        width: scrollWidth,
        height: scrollHeight,
        windowWidth: scrollWidth,
        windowHeight: scrollHeight,
        useCORS: true,
        allowTaint: true,
      });

      // Reset styles
      Object.keys(originalStyles).forEach((key) => {
        element.style[key] = originalStyles[key];
      });

      // Convert canvas to PDF
      const doc = new jsPDF();
      const imgData = canvas.toDataURL("image/png");

      // Calculate PDF dimensions while maintaining aspect ratio
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (scrollHeight * pdfWidth) / scrollWidth;

      // Add image to PDF
      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Save the PDF
      const blob = doc.output("blob");
      // doc.save(`${invoiceNumber}.pdf`);

      const formData = new FormData();
      formData.append("invoice", blob, "invoice.pdf");
      const response = await fetch(`${api.uploadInvoice}?invoiceNo=${invoiceData.invoiceNumber}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setLoader(false);
        window.alert("Pdf sent.");
        // Reset form fields or navigate to another page
      } else {
        console.error("Error uploading pdf:", response.statusText);
        window.alert("something went wrong, Please try again");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Handle error appropriately
    } finally {
      // Ensure styles are reset even if an error occurs
      Object.keys(originalStyles).forEach((key) => {
        element.style[key] = originalStyles[key];
      });
      setLoader(false);
    }
  };

  return (
    <div>
      <div
        id="invoiceContainer"
        className="border rounded shadow-sm bg-white"
        style={{
          width: "100%",
          height: "800px", // Changed from fixed height
          // minHeight: "900px", // Added minimum height
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          // position: "relative",
        }}
      >
        <div className="row">
          <div className="col-md-8 mt-5">
            <h3 className="text-uppercase">{company_registrated_name}</h3>
            <h1 className="display-3">INVOICE</h1>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-center">
            <img
              // className="img-fluid"
              src="/images/invoicelogo.png"
              alt="Logo"
              height={150}
              width={150}
              // style={{ maxHeight: "250px", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Address Blocks */}
        <div className="row mb-4">
          <div className="col-md-4">
            <h4>BILL TO:</h4>
            <p className="h6">
              <b>Name:</b> {name}
            </p>
            <p className="h6">
              <b>Address:</b>
              {/* {address} */}
            </p>
            <p className="h6">
              <b>Contact:</b> {mobNo}
            </p>
          </div>
          <div className="col-md-4">
            <h4>FROM:</h4>
            <p style={{ fontFamily: "sans-serif" }}>
              HEALTHPATH F-33 RIGROSS COMPLEX C,BLOCK SECTOR 57 GURGAON ,HARYANA
              CONTACT : +91 84485 59925 GSTIN : XXXXXXXXXXXXXX
            </p>
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
              {invoiceData.items.map((item, idx) => (
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
            <p className="row">
              <b className="col">Subtotal:</b>
              <div className="col">₹ {subTotal}</div>
            </p>
            <p className="row">
              <b className="col">GST:</b>
              <div className="col">₹ {gst}</div>
            </p>
            <p className="row">
              <b className="col">Discount:</b>
              <div className="col">₹ {discount}</div>
            </p>
            <p className="row">
              <b className="col">Freight:</b>
              <div className="col">₹ {freight}</div>
            </p>
            <p className="row">
              <b className="col">Tax:</b>
              <div className="col">₹ {tax}</div>
            </p>
            <hr style={{ borderWidth: "2.2px", backgroundColor: "#000000" }} />
            <p className="row h5">
              <b className="col">TOTAL:</b>
              <div className="col">₹ {totalPrice}</div>
            </p>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-4 d-flex flex-row">
          <p className="font-weight-bold">TOTAL IN WORDS:</p>
          <p className="ml-3 text-uppercase">One Hundred Only</p>
        </div>
        <div>
          <hr />
          <p className="font-weight-bold small">TERMS & CONDITIONS:</p>
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
          className=" row text-center border-top p-3"
          style={{ backgroundColor: `${invoice_bill_yellow_color}` }}
        >
          <div className="col-md-6 text-left">
            <p className="mb-1 text-center h2 font-weight-bold">Thank you!</p>
            <p className="mb-0 text-center">TTANSHE HEALTH PATH PVT. LTD</p>
          </div>
          <div className="col-md-6 text-right text-black font-weight-bold">
            <p className="mb-0">Contact: +91 84485 59925</p>
            <p className="mb-0">www.healthpath.co.in</p>
            <p>customercare@healthpath.co.in</p>
          </div>
        </div>
      </div>
      <div className="row mt-3 mb-3" style={{ marginLeft: "40%" }}>
        <div className="col col-md-2 mr-5">
          <button
            className="btn btn-primary"
            onClick={() => {
              generatePDF();
            }}
          >
            Generate & Send
          </button>
        </div>
        <div className="col ml-5">
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </div>
      {loader && <Preloader />}
    </div>
  );
};
export default GenerateInvoiceImage;
