// DocPrescriptionGeneratePdf.js
import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button, Col, Row } from "react-bootstrap";
import { api, contact_no } from "../../../constant";
import Preloader from "../../Preloader";
import Image from "next/image";
import { formatData } from "../utils/helper";
import {
  CHIEF_COMPLAINTS_TXT,
  HISTORY_KNOWN_ALLERGY_TXT,
  KNOWN_CASES_TXT,
  UNDER_TREATMENT_TXT,
} from "../utils/constant";
import { sign } from "crypto";
import CircleLoader from "../../circleLoader";
import { sendFileToFirebase, sendPrescriptionToFirebase } from "../../../utils";

const DocPrescriptionGeneratePdf = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [signNstampLoader, setSignNstampLoader] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [stampUrl, setStampUrl] = useState(null);
  console.log(data, "data in generator");

  const signPrescription = () => {
    setSignNstampLoader(true);
    const fetchImage = async (firebasePath, setter) => {
      if (firebasePath) {
        try {
          const response = await fetch(
            `${api.getImageFomrFirebase}?imageUrl=${encodeURIComponent(
              firebasePath
            )}`
          );
          if (response.ok) {
            const blob = await response.blob();
            const localUrl = URL.createObjectURL(blob);
            setter(localUrl);
          } else {
            console.error(
              `Failed to fetch image for ${firebasePath}:`,
              response.status,
              response.statusText
            );
            // Handle error (e.g., set a default placeholder)
          }
        } catch (error) {
          console.error(`Error fetching image for ${firebasePath}:`, error);
          // Handle error
        } finally {
          setSignNstampLoader(false);
        }
      } else {
        setter(null);
      }
    };

    if (data.doctorSignatureUrl) {
      // Extract the path from the full Firebase URL if needed
      const signaturePath = data.doctorSignatureUrl;
      // .split('?')[0].replace(/https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\//, '').split('%2F').slice(1).join('/');
      fetchImage(signaturePath, setSignatureUrl);
    }

    if (data.doctorStampUrl) {
      // Extract the path from the full Firebase URL if needed
      const stampPath = data.doctorStampUrl;
      // .split('?')[0].replace(/https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\//, '').split('%2F').slice(1).join('/');
      fetchImage(stampPath, setStampUrl);
    }

    // Cleanup function to revoke object URLs
    return () => {
      if (signatureUrl) {
        URL.revokeObjectURL(signatureUrl);
      }
      if (stampUrl) {
        URL.revokeObjectURL(stampUrl);
      }
    };
  };

  const handleDownloadPDF = async () => {
    if (!signatureUrl || !stampUrl) {
      window.alert("Please sign the prescription before downloading.");
      return;
    }

    setLoading(true);
    try {
      const doc = new jsPDF();
      const canvas = await html2canvas(document.getElementById("pdfContainer"));

      const imgData = canvas.toDataURL("image/png");
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      doc.save(`Prescription_${data.patientName}_${Date.now()}.pdf`);

      // Generate blob for Firebase upload and background save
      const blob = doc.output("blob");
      const details = {
        patientName: data.patientName,
        doctorName: data.doctorName,
      };

      const prescriptionUrl = await sendPrescriptionToFirebase(blob, details);

      if (prescriptionUrl) {
        // Call background API to save prescription to database
        await fetch(`${api.helperApi}?action=savePrescription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: data.appointmentId,
            doctorId: data.doctorId,
            doctorName: data.doctorName,
            doctorEmail: data.doctorEmail,
            doctorPhone: data.doctorPhone,
            doctorRegistrationNo: data.doctorRegistrationNo,
            doctorSpeciality: data.doctorSpeciality,
            doctorStampUrl: data.doctorStampUrl,
            doctorSignatureUrl: data.doctorSignatureUrl,
            patientId: data.patientId,
            patientName: data.patientName,
            patientAge: data.age,
            patientGender: data.gender,
            patientPhone: data.patientNo,
            patientEmail: data.patientEmail,
            patientAddress: data.patientAddress,
            chiefComplaints: data.cheifCompalaints ? [data.cheifCompalaints] : [],
            diagnosis: data.diagnosis,
            medicalHistory: data.knownCases ? [data.knownCases] : [],
            allergies: data.anyDrugAllergy ? [data.anyDrugAllergy] : [],
            medicines: data.medicineInfo,
            tests: data.testAdvices ? [{ testName: data.testAdvices }] : [],
            advice: data.advices,
            followUpDate: data.followUpdateDate,
            notes: data.notes,
            prescriptionPdfUrl: prescriptionUrl,
          }),
        });
      }
    } catch (error) {
      console.error("PDF download error:", error.message);
      window.alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const canvas = await html2canvas(document.getElementById("pdfContainer"));

      const imgData = canvas.toDataURL("image/png");
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const blob = doc.output("blob");
      const details = {
        patientName: data.patientName,
        doctorName: data.doctorName,
      };

      const prescriptionUrl = await sendPrescriptionToFirebase(blob, details);

      if (!prescriptionUrl) {
        throw new Error("Failed to upload PDF to Firebase.");
      }

      // Now send just appointmentId and prescriptionUrl to your API
      const response = await fetch(api.prescriptionCall, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: data.appointmentId,
          prescriptionUrl: prescriptionUrl,
        }),
      });

      if (response.ok) {
        window.alert("PDF sent successfully.");
      } else {
        console.error("Error saving prescription URL:", response.statusText);
        window.alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("PDF generation/upload error:", error.message);
      window.alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log(data, "data in generator");
    const handleResize = () => {
      const mq = window.matchMedia("(max-width: 750px)");
      const pdfContent = document.getElementById("pdfContent");
      const sendPdfBtn = document.getElementById("sendButton");
      if (mq.matches) {
        pdfContent.style.marginLeft = "335px"; // Apply marginLeft for mobile screens
        sendPdfBtn.style.marginLeft = "300px";
      } else {
        pdfContent.style.marginRight = "300"; // Reset marginLeft for larger screens
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
    no: "5%", // Adjust as needed
    medicine: "35%", // Adjust as needed
    generic: "10%", // Adjust as needed
    dosage: "35%", // Adjust as needed
    duration: "15%", // Adjust as needed
  };

  // Dynamically generate table header (TH) elements based on columnWidths
  const tableHeaders = Object.entries(columnWidths).map(([key, width]) => (
    <th key={key} style={{ width }}>
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </th>
  ));

  const transformedData = data.medicineInfo.map((item, index) => {
    return {
      // index: index + 1, // Start from 1
      medicine: item.medicineName,
      generic: item.medicineGeneric,
      dosage: `${item.dosage} ${item.unit}: ${item.noOfTimes} times ${item.frequency}: ${item.medicationSchedule}`,
      duration: item.days,
    };
  });

  // Dynamically generate table rows (TR) and cells (TD) based on transformedData
  const tableRows = transformedData.map((rowData, index) => (
    <tr key={index}>
      <td style={{ fontSize: "12px" }}>{index + 1}</td>
      <td style={{ fontSize: "12px" }}>{rowData.medicine}</td>
      <td style={{ fontSize: "12px" }}>{rowData.generic}</td>
      <td style={{ fontSize: "12px" }}>{rowData.dosage}</td>
      <td style={{ fontSize: "12px" }}>{rowData.duration}</td>
    </tr>
  ));

  return (
    <div
      id="pdfContainer"
      style={{
        textAlign: "center",
        borderColor: "AppWorkspace",
        backgroundImage: `url('/images/Doctor/prescriptionLetterHead.jpg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        width: "720px", // Set fixed width
        margin: "0 auto", // Center horizontally
        height: "1000px",
        fontFamily: "TT Ramillas, sans-serif",
      }}
    >
      <div className="h6 font-weight-bold mt-5">{`Date - ${formatData(
        new Date()
      )}`}</div>
      <div
        id="pdfContent"
        style={{
          marginTop: "27%",
          marginLeft: "5%",
          marginRight: "5%",
        }}
      >
        <div className="row mt-2">
          <div className="col text-left h6" md={10}>
            <div className="font-weight-bold">ID - {data.patientId}</div>
            <div>{`${data.patientName} (${data.gender.slice(0, 1)}) / ${
              data.age
            }Y / ${data.patientNo}`}</div>
          </div>
          <div className="text-right mr-2 h6">
            <div className="text-primary font-weight-bold">
              <b>Dr.</b>
              {data.doctorName}
            </div>
            <div>{`${data.doctorDegree} | Reg No.270988`}</div>
            <div>{`Mob No. ${data.doctorMobNo}`}</div>
          </div>
        </div>
        <div md={2} className="col text-left">
          <img
            className="img-fluid"
            src="/images/Doctor/RXIcon.png"
            alt="Rx logo"
            width={30}
          />
        </div>
        <div className="row mt-2">
          <div className="col text-left">
            <h6>
              <b>{KNOWN_CASES_TXT}</b> - {data.knownCases}
            </h6>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col text-left">
            <h6>
              <b>{HISTORY_KNOWN_ALLERGY_TXT}</b> - {data.anyDrugAllergy}
            </h6>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col text-left">
            <h6>
              <b>{CHIEF_COMPLAINTS_TXT}</b> - {data.cheifCompalaints}
            </h6>
            <h6>
              <b>{UNDER_TREATMENT_TXT}</b> - {data.underTreatmentSince}
            </h6>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <table className="border border-dark m-2 rounded">
              {/* Table */}
              <thead className="border border-dark text-dark h6">
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

        <div className="row mr-4 mt-5" style={{ height: "70px" }}>
          <div className="col text-left h6">
            <b>Advices - </b>
            <div>{data.advices}</div>
            <b>Notes - </b>
            <div>{data.notes}</div>
            <b>Test Adviced</b>
            <div>{data.testAdvices}</div>
          </div>
          <div className="col text-right mt-2">
            {/* Doctor Stamp */}
            <div>
              {stampUrl && (
                <Image
                  src={stampUrl}
                  alt="Doctor Stamp"
                  width={100}
                  height={70}
                />
              )}
            </div>
            <div className="mt-2">
              {signatureUrl && (
                <Image
                  src={signatureUrl}
                  alt="Doctor Signature"
                  width={100}
                  height={70}
                />
              )}
            </div>
            <div className="float-right mt-5 mr-4">
              {signNstampLoader && <CircleLoader />}
            </div>
          </div>
        </div>
      </div>
      <div className="row text-center" style={{ marginTop: "55%" }}>
        <div className="col mb-3">
          <Button
            id="sendButton"
            onClick={handleCreatePDF}
            style={{ backgroundColor: "#8e8333" }}
            disabled
          >
            <strong>Send PDF</strong>
          </Button>
        </div>
        <div className="col mb-3">
          <Button
            id="downloadButton"
            onClick={handleDownloadPDF}
            style={{ backgroundColor: "#3a5e1c" }}
          >
            <strong>Download PDF</strong>
          </Button>
        </div>
        <div className="col mb-3">
          <div
            className="btn"
            id="sendButton"
            onClick={signPrescription}
            style={{ backgroundColor: "#8e8333" }}
          >
            <strong>Sign PDF</strong>
          </div>
        </div>
      </div>
      {loading ? <Preloader /> : null}
    </div>
  );
};

export default DocPrescriptionGeneratePdf;
