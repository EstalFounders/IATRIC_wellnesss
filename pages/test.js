import { useState } from "react";
import Image from "next/image";
import {
  company_registrated_name,
  invoice_bill_yellow_color,
} from "../src/constant";
import style from "./api/css/generateInvoiceImagecss.module.css";
import { formatData } from "../src/components/registerDocComponent/utils/helper";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const date = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const invoiceData = {
    patientName: "ABCD",
    address: "Darcy, 123 Anywhere St., Any City",
    phone: "00000000",
    invoiceNo: "A09785",
    date: date,
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
      const response = await fetch("/api/lib/sendConsultationReminder", {
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
    <div>
      <h1>Store Lab Test Data</h1>
      {/* <button onClick={handleFetch}>Store Data</button> */}
      <button onClick={handleFetch}>create column</button>
      {message && <p>{message}</p>}
    </div>
  );
}
