import { useState } from "react";
import Image from "next/image";
import {
  company_registrated_name,
  invoice_bill_yellow_color,
} from "../src/constant";
import style from "./api/css/generateInvoiceImagecss.module.css";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const invoiceData = {
    patientName: "ABCD",
    address: "Darcy, 123 Anywhere St., Any City",
    phone: "00000000",
    invoiceNo: "A09785",
    date: "15/05/2023",
    items: [
      {
        description: "Doctors consultation",
        hsn: "01",
        qty: "01",
        discount: "₹ 0",
        price: "150",
        total: "150",
      },
      {
        description: "lab test",
        hsn: "01",
        qty: "01",
        discount: "₹ 0",
        price: "100",
        total: "100",
      },
      {
        description: "Wound dressing",
        hsn: "01",
        qty: "01",
        discount: "₹ 0",
        price: "150",
        total: "150",
      },
      {
        description: "Nursing fees",
        hsn: "01",
        qty: "01",
        discount: "₹ 0",
        price: "170",
        total: "170",
      },
      {
        description: "medicine",
        hsn: "01",
        qty: "01",
        discount: "₹ 0",
        price: "100",
        total: "100",
      },
    ],
    subtotal: 1000,
    gst: 30,
    discount: 30,
    freight: 30,
    tax: 30,
    total: 970,
  };

  const handleFetch = async () => {
    try {
      const response = await fetch("/api/test", {
        method: "POST",
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage("Error occurred while storing data");
      console.error("Fetch error:", error);
    }
  };

  return (
    // <div>
    //   <h1>Store Lab Test Data</h1>
    //   {/* <button onClick={handleFetch}>Store Data</button> */}
    //   <button onClick={handleFetch}>Send WhatsApp</button>
    //   {message && <p>{message}</p>}
    // </div>
    <div className="container w-50 border rounded shadow-sm bg-white">
      {/* Header */}
      <div className="row">
        <div className="col-md-8 mt-5">
          <h3 className="text-uppercase">{company_registrated_name}</h3>
          <h1 className="display-3">INVOICE</h1>
        </div>
        <div className="col-md-4">
          <Image
            src="/images/invoicelogo.png"
            alt="Logo"
            className="img-fluid"
            height={100}
            width={150}
            style={{ maxHeight: "250px" }}
          />
        </div>
      </div>

      {/* Address Blocks */}
      <div className="row mb-4">
        <div className="col-md-4">
          <h4>BILL TO:</h4>
          <p className="h6">
            <b>Name:</b> {invoiceData.patientName}
          </p>
          <p className="h6">
            <b>Address:</b>
            {invoiceData.address}
          </p>
          <p className="h6">
            <b>Contact:</b> {invoiceData.phone}
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
          <p>
            <b>Invoice No:</b> {invoiceData.invoiceNo}
          </p>
          <p>
            <b>Date:</b> {invoiceData.date}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="table-responsive mb-4">
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
                <td>{item.description}</td>
                <td>{item.hsn}</td>
                <td>{item.qty}</td>
                <td>{item.discount}</td>
                <td>₹ {item.price}</td>
                <td>₹ {item.total}</td>
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
            <div className="col">₹ {invoiceData.subtotal}</div>
          </p>
          <p className="row">
            <b className="col">GST:</b>
            <div className="col">₹ {invoiceData.gst}</div>
          </p>
          <p className="row">
            <b className="col">Discount:</b>
            <div className="col">₹ {invoiceData.discount}</div>
          </p>
          <p className="row">
            <b className="col">Freight:</b>
            <div className="col">₹ {invoiceData.freight}</div>
          </p>
          <p className="row">
            <b className="col">Tax:</b>
            <div className="col">₹ {invoiceData.tax}</div>
          </p>
          <hr style={{ borderWidth: "2.2px", backgroundColor: "#000000" }} />
          <p className="row h5">
            <b className="col">TOTAL:</b>
            <div className="col">₹ {invoiceData.total}</div>
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
          <li>THIS IS A COMPUTER GENERATED INVOICE. NO SIGNATURE REQUIRED.</li>
        </ol>
        <hr />
      </div>

      {/* Footer */}
      <div className=" row text-center border-top p-3" style={{backgroundColor: `${invoice_bill_yellow_color}`}}>
        <div className="col-md-6 text-left">
        <p className="mb-1 text-center h2 font-weight-bold">Thank you!</p>
        <p className="mb-0 text-center">TTANSHE HEALTH PATH PVT. LTD</p>
        </div>
        <div className="col-md-6 text-right text-black font-weight-bold">
        <p className="mb-0">
          Contact: +91 84485 59925 
          </p>
        <p className="mb-0">
          www.healthpath.co.in 
          </p>
        <p>
          customercare@healthpath.co.in
        </p>
        </div>
      </div>
    </div>
  );
}
