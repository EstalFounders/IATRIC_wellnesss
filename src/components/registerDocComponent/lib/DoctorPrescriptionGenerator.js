// DocPrescriptionGeneratePdf.js
import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "react-bootstrap";
import { api } from "../../../constant";
import Preloader from "../../Preloader";
import Image from "next/image";
import { formatData } from "../utils/helper";
import {
  CHIEF_COMPLAINTS_TXT,
  HISTORY_KNOWN_ALLERGY_TXT,
  KNOWN_CASES_TXT,
  UNDER_TREATMENT_TXT,
} from "../utils/constant";
import CircleLoader from "../../circleLoader";
import { sendPrescriptionToFirebase } from "../../../utils";

const PDF_WIDTH = 720;
const PDF_HEIGHT = 1000;

const DocPrescriptionGeneratePdf = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [signNstampLoader, setSignNstampLoader] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [stampUrl, setStampUrl] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const padding = 32;
      const available = window.innerWidth - padding;
      setPreviewScale(available < PDF_WIDTH ? available / PDF_WIDTH : 1);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const signPrescription = () => {
    setSignNstampLoader(true);
    const fetchImage = async (firebasePath, setter) => {
      if (firebasePath) {
        try {
          const response = await fetch(
            `${api.getImageFomrFirebase}?imageUrl=${encodeURIComponent(firebasePath)}`
          );
          if (response.ok) {
            const blob = await response.blob();
            setter(URL.createObjectURL(blob));
          } else {
            console.error(`Failed to fetch image for ${firebasePath}:`, response.status);
          }
        } catch (error) {
          console.error(`Error fetching image for ${firebasePath}:`, error);
        } finally {
          setSignNstampLoader(false);
        }
      } else {
        setter(null);
      }
    };

    if (data.doctorSignatureUrl) fetchImage(data.doctorSignatureUrl, setSignatureUrl);
    if (data.doctorStampUrl) fetchImage(data.doctorStampUrl, setStampUrl);

    return () => {
      if (signatureUrl) URL.revokeObjectURL(signatureUrl);
      if (stampUrl) URL.revokeObjectURL(stampUrl);
    };
  };

  const handleDownloadPDF = async () => {
    if (!signatureUrl || !stampUrl) {
      window.alert("Please sign the prescription before downloading.");
      return;
    }

    setLoading(true);
    try {
      const element = document.getElementById("pdfContainer");

      // Temporarily reset transform so html2canvas captures at full resolution
      const originalTransform = element.style.transform;
      element.style.transform = "none";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: PDF_WIDTH,
        scrollY: -window.scrollY,
      });

      element.style.transform = originalTransform;

      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pdfWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Prescription_${data.patientName}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      const prescriptionUrl = await sendPrescriptionToFirebase(blob, {
        patientName: data.patientName,
        doctorName: data.doctorName,
      });

      if (prescriptionUrl) {
        await fetch(`${api.helperApi}?action=savePrescription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: data.appointmentId,
            prescriptionPdfUrl: prescriptionUrl,
          }),
        });
      }
    } catch (error) {
      console.error("PDF download error:", error);
      window.alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePDF = async () => {
    setLoading(true);
    try {
      const element = document.getElementById("pdfContainer");
      const originalTransform = element.style.transform;
      element.style.transform = "none";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: PDF_WIDTH,
        scrollY: -window.scrollY,
      });
      element.style.transform = originalTransform;

      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pdfWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const blob = doc.output("blob");
      const prescriptionUrl = await sendPrescriptionToFirebase(blob, {
        patientName: data.patientName,
        doctorName: data.doctorName,
      });

      if (!prescriptionUrl) throw new Error("Failed to upload PDF to Firebase.");

      const response = await fetch(api.prescriptionCall, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: data.appointmentId,
          prescriptionUrl,
        }),
      });

      if (response.ok) {
        window.alert("Prescription sent successfully.");
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

  const columnWidths = {
    no: "5%",
    medicine: "35%",
    generic: "10%",
    dosage: "35%",
    duration: "15%",
  };

  const tableHeaders = Object.entries(columnWidths).map(([key, width]) => (
    <th key={key} style={{ width }}>
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </th>
  ));

  const transformedData = data.medicineInfo.map((item) => ({
    medicine: item.medicineName,
    generic: item.medicineGeneric,
    dosage: `${item.dosage} ${item.unit}: ${item.noOfTimes} times ${item.frequency}: ${item.medicationSchedule}`,
    duration: item.days,
  }));

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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "16px 0",
      }}
    >
      {/* Scaled preview wrapper — keeps pdfContainer at PDF_WIDTH for accurate capture */}
      <div
        style={{
          width: `${PDF_WIDTH * previewScale}px`,
          height: `${PDF_HEIGHT * previewScale}px`,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        }}
      >
        <div
          id="pdfContainer"
          style={{
            transformOrigin: "top left",
            transform: `scale(${previewScale})`,
            textAlign: "center",
            backgroundImage: `url('/images/Doctor/prescriptionLetterHead.jpg')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            width: `${PDF_WIDTH}px`,
            minHeight: `${PDF_HEIGHT}px`,
            fontFamily: "TT Ramillas, sans-serif",
            backgroundColor: "#ffffff",
          }}
        >
          <div className="h6 font-weight-bold mt-5">{`Date - ${formatData(new Date())}`}</div>
          <div
            id="pdfContent"
            style={{ marginTop: "27%", marginLeft: "5%", marginRight: "5%" }}
          >
            <div className="row mt-2">
              <div className="col text-left h6" md={10}>
                <div className="font-weight-bold">ID - {data.patientId}</div>
                <div>{`${data.patientName} (${data.gender.slice(0, 1)}) / ${data.age}Y / ${data.patientNo}`}</div>
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
                  <thead className="border border-dark text-dark h6">
                    <tr>{tableHeaders}</tr>
                  </thead>
                  <tbody>{tableRows}</tbody>
                </table>
              </div>
            </div>
            <div>
              <h6 className="text-left">
                * Apply generic equivalent wherever applicable subject to Availability
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
                <div>
                  {stampUrl && (
                    <Image src={stampUrl} alt="Doctor Stamp" width={100} height={70} />
                  )}
                </div>
                <div className="mt-2">
                  {signatureUrl && (
                    <Image src={signatureUrl} alt="Doctor Signature" width={100} height={70} />
                  )}
                </div>
                <div className="float-right mt-5 mr-4">
                  {signNstampLoader && <CircleLoader />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons — outside pdfContainer so they don't appear in the PDF */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
          padding: "20px 16px",
          width: "100%",
        }}
      >
        <Button
          onClick={handleCreatePDF}
          disabled={loading}
          style={{ backgroundColor: "#8e8333", border: "none" }}
        >
          <strong>{loading ? "Sending..." : "Send PDF"}</strong>
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={loading}
          style={{ backgroundColor: "#3a5e1c", border: "none" }}
        >
          <strong>Download PDF</strong>
        </Button>
        <Button
          onClick={signPrescription}
          disabled={loading || signNstampLoader}
          style={{ backgroundColor: "#8e8333", border: "none" }}
        >
          <strong>{signNstampLoader ? "Signing..." : "Sign PDF"}</strong>
        </Button>
      </div>

      {loading && <Preloader />}
    </div>
  );
};

export default DocPrescriptionGeneratePdf;
