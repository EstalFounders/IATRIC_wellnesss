// DocPrescriptionGeneratePdf.js
import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button, Col, Row } from "react-bootstrap";
import { api, contact_no } from "../../../constant";
import Preloader from "../../Preloader";

const DocPrescriptionGeneratePdf = ({ data }) => {
  // const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false)

  const handleCreatePDF = async () => {
    setLoading(true)
    const doc = new jsPDF();
    const canvas = await html2canvas(document.getElementById("pdfContent"));
    const imgData = canvas.toDataURL("image/png");
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Save the PDF to a blob
    const blob = doc.output("blob");
    const formData = new FormData();
    formData.append("prescriptionpdfFile", blob, "document.pdf");
    formData.append("patientName", data.pateintName);
    formData.append("doctorName", data.doctorName);

    // Send FormData to server using AJAX (for example, using Axios)
    try {
      const response = await fetch(api.prescriptionCall, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setLoading(false)
        window.alert("Pdf sent.");
        // Reset form fields or navigate to another page
      } else {
        console.error("Error uploading pdf:", response.statusText);
        window.alert("something went wrong, Please try again");
      }
    } catch (error) {
      console.error("Error uploading pdf:", error.message);
    } finally {
      setLoading(false)
    }
  };



  useEffect(() => {
    console.log(data, "data in generator");
    const handleResize = () => {
      const mq = window.matchMedia("(max-width: 750px)");
      const pdfContent = document.getElementById("pdfContent");
      const sendPdfBtn = document.getElementById("sendButton");
      if (mq.matches) {
        pdfContent.style.marginLeft = "335px"; // Apply marginLeft for mobile screens
        sendPdfBtn.style.marginLeft = "300px";
      } else {
        pdfContent.style.marginLeft = "0"; // Reset marginLeft for larger screens
      }
    };
    // Call handleResize initially and add event listener for resize
    handleResize();
    window.addEventListener("resize", handleResize);
    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data]); // Em

  // Define the column widths for TH elements
  const columnWidths = {
    medicine: "35%", // Adjust as needed
    generic: "15%", // Adjust as needed
    dosage: "35%", // Adjust as needed
    duration: "15%", // Adjust as needed
  };

  // Dynamically generate table header (TH) elements based on columnWidths
  const tableHeaders = Object.entries(columnWidths).map(([key, width]) => (
    <th key={key} style={{ width }}>
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </th>
  ));

  const transformedData = data.medicineInfo.map((item) => {
    return {
      medicine: item.medicineName,
      generic: item.medicineGeneric,
      dosage: `${item.dosage} ${item.unit}: ${item.noOfTimes} times ${item.frequency}: ${item.medicationSchedule}`, // Concatenate multiple fields for dosage
      duration: item.days,
    };
  });

  // Dynamically generate table rows (TR) and cells (TD) based on transformedData
  const tableRows = transformedData.map((rowData, index) => (
    <tr key={index}>
      <td style={{ fontSize: "12px" }}>{rowData.medicine}</td>
      <td style={{ fontSize: "12px" }}>{rowData.generic}</td>
      <td style={{ fontSize: "12px" }}>{rowData.dosage}</td>
      <td style={{ fontSize: "12px" }}>{rowData.duration}</td>
    </tr>
  ));

  return (
    <div style={{ textAlign: "center", borderColor: "AppWorkspace" }}>
      <div
        id="pdfContent"
        style={{
          backgroundImage: `url('/images/Doctor/prescriptionLetterHead.jpg')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          width: "690px", // Set fixed width
          margin: "0 auto", // Center horizontally
          height: "1000px",
        }}
      >
        {/* Content to be placed on the background image */}
        <Row>
          <Col className="text-right mr-2 mt-5">
            <h6>
              <b>Docto Name: </b>
              {data.doctorName}
            </h6>
            <h6>Regn no: 9988877</h6>
            <h6>Address: 5045 near kong kong bazaar</h6>
            <h6>sector 57, gurgoan</h6>
            <h6>Contact: {contact_no}</h6>
          </Col>
        </Row>
        <div className="row mt-3">
          {/* <div md={2} className="col text-left">
            <img
              className="img-fluid mt-2"
              src="/images/Doctor/RXIcon.png"
              alt="Rx logo"
              width={100}
            />
          </div> */}
          <div className="col text-right" md={10}>
            <h6>
              <b>Pateint name: </b> - {data.pateintName}
            </h6>
            <h6>
              <b>Address: </b>
            </h6>
            <h6>
              <b>Age: </b> {data.age}
            </h6>
            <h6>
              <b>Gender:</b> {data.gender}
            </h6>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col text-left">
            <h6>
              <b>Last Health Test Done</b>
            </h6>
            <h6>{data.lastHealthTest}</h6>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col text-left">
            <h6>
              <b>Any history of known allergy</b>
            </h6>
            <h6>{data.anyDrugAllergy}</h6>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col text-left">
            <h6>
              <b>SYMPTOMS/CONDITION</b> - {data.presentIllness}
            </h6>
            <h6>
              <b>Under Treatment since</b> - {data.presentIllnessSinceWhen}
            </h6>
            <h6>
              <b>Current status</b> - {data.currentStatusPresentIllness}
            </h6>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <table className="border border-dark m-2 rounded">
              {/* Table */}
              <thead className="border border-dark text-dark">
                <tr>{tableHeaders}</tr>
              </thead>
              <tbody>
                {/* Table body content */}
                {tableRows}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h6 className="text-left">
            {" "}
            * Apply generic equivalent wherever applicable subject to
            Availability
          </h6>
        </div>
        <div className="row mt-2 mr-4">
          <div className="col text-right mt-2">
            {/* Doctor Signature */}
            {data.doctorSignatureUrl && (
              <img
                src={data.doctorSignatureUrl}
                alt="Doctor Signature"
                style={{
                  maxWidth: "70px", // Adjust as needed
                }}
              />
            )}
          </div>
        </div>
        <div className="row mr-4">
          <div className="col text-right mt-2">
            {/* Doctor Stamp */}
            {data.doctorStampUrl && (
              <img
                src={data.doctorStampUrl}
                alt="Doctor Stamp"
                style={{
                  maxWidth: "100px", // Adjust as needed
                }}
              />
            )}
          </div>
        </div>
      </div>
      <Col className="text-center mt-2">
        <Button
          id="sendButton"
          onClick={handleCreatePDF}
          style={{ backgroundColor: "#8e8333" }}
        >
          <strong>Send PDF</strong>
        </Button>
      </Col>
     {loading ? <Preloader />: null}
    </div>
  );
};

export default DocPrescriptionGeneratePdf;
