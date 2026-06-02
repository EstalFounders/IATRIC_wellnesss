// DocPrescriptionGeneratePdf.js
import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "react-bootstrap";
import { api, color_schema, style_schema } from "../../../constant";
import Preloader from "../../Preloader";
import Image from "next/image";
import { formatData } from "../utils/helper";
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
            `${api.getImageFomrFirebase}?imageUrl=${encodeURIComponent(firebasePath)}`,
          );
          if (response.ok) {
            const blob = await response.blob();
            setter(URL.createObjectURL(blob));
          } else {
            console.error(
              `Failed to fetch image for ${firebasePath}:`,
              response.status,
            );
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

    if (data.doctorSignatureUrl)
      fetchImage(data.doctorSignatureUrl, setSignatureUrl);
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
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

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
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

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

      if (!prescriptionUrl)
        throw new Error("Failed to upload PDF to Firebase.");

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

  const G = color_schema.green; // #3b5f1d
  const RULE = "1px solid #aaa";

  // Advices → indented line items (comma or newline separated)
  const adviceItems = data.advices
    ? String(data.advices)
        .split(/[,\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "16px 0",
        fontFamily: style_schema.font_family || "TT Ramillas, serif",
      }}
    >
      {/* Scaled preview wrapper */}
      <div
        style={{
          width: `${PDF_WIDTH * previewScale}px`,
          height: `${PDF_HEIGHT * previewScale}px`,
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
        }}
      >
        <div
          id="pdfContainer"
          style={{
            transformOrigin: "top left",
            transform: `scale(${previewScale})`,
            width: `${PDF_WIDTH}px`,
            minHeight: `${PDF_HEIGHT}px`,
            backgroundColor: "#ffffff",
            backgroundImage: `url('/images/Doctor/prescriptionLetterHead.jpg')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* ══ DOCTOR CREDENTIALS — overlaid top-right on letterhead ══ */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "22px 32px 0 0",
            }}
          >
            <div style={{ textAlign: "right", lineHeight: "1.4" }}>
              <div style={{ fontSize: "14px", color: "#111" }}>
                Dr.{data.doctorName}
              </div>
              <div style={{ fontSize: "13px", color: "#222" }}>
                {data.doctorDegree
                  ? data.doctorDegree.split(",")[0].trim()
                  : "Family Physician"}
              </div>

              <div style={{ fontSize: "13px", color: "#222" }}>
                Reg no : {data.doctorRegNo || "10152"}
              </div>
            </div>
          </div>

          {/* ══ MAIN CONTENT — starts below letterhead image ══ */}
          <div style={{ marginTop: "20%", padding: "0 32px" }}>
            {/* ── Patient row ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderTop: RULE,
                borderBottom: RULE,
                padding: "7px 0",
                fontSize: "13px",
              }}
            >
              <div style={{ lineHeight: "1.6" }}>
                <div>Patient id&nbsp;{data.patientId}</div>
                <div>
                  {data.patientName}&nbsp;,&nbsp;{data.age}&nbsp;yr&nbsp;,&nbsp;
                  {data.gender ? data.gender.slice(0, 1).toUpperCase() : ""}
                </div>
              </div>
              <div>{formatData(new Date())}</div>
            </div>

            {/* ── Clinical section — 2-column plain text ── */}
            <div
              style={{
                display: "flex",
                marginTop: "12px",
                paddingBottom: "12px",
                borderBottom: RULE,
                fontSize: "13px",
              }}
            >
              {/* Left */}
              <div style={{ flex: 1, paddingRight: "20px", lineHeight: "1.6" }}>
                <div style={{ fontWeight: 500 }}>
                  HOPI (History of present illness)
                </div>
                <div style={{ marginBottom: "8px" }}>
                  {data.cheifCompalaints || "—"}
                </div>
                <div style={{ fontWeight: 500 }}>Provisional diagnosis</div>
                <div>
                  {data.provisionalDiagnosis || data.underTreatmentSince || "—"}
                </div>
              </div>
              {/* Right */}
              <div style={{ flex: 1, paddingLeft: "20px", lineHeight: "1.6" }}>
                <div style={{ fontWeight: 500 }}>Known Case of</div>
                <div style={{ marginBottom: "8px" }}>
                  {data.knownCases || "NA"}
                </div>
                <div style={{ fontWeight: 500 }}>History of known allergy</div>
                <div>{data.anyDrugAllergy || "NA"}</div>
              </div>
            </div>

            {/* ── Rx + Medicine table ── */}
            <div style={{ marginTop: "10px", position: "relative" }}>
              {/* "HealthPath" watermark text behind table */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 0,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: "72px",
                    fontWeight: 800,
                    color: G,
                    opacity: 0.06,
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    letterSpacing: "4px",
                  }}
                >
                  HealthPath
                </span>
              </div>

              {/* Rx icon */}
              <div
                style={{ position: "relative", zIndex: 1, marginBottom: "4px" }}
              >
                <img
                  src="/images/Doctor/RXIcon.png"
                  alt="Rx"
                  style={{ width: "34px", mixBlendMode: "multiply" }}
                />
              </div>

              {/* Table */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  position: "relative",
                  zIndex: 1,
                  border: "1px solid #bbb",
                  fontSize: "12px",
                  backgroundColor: "transparent",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #bbb" }}>
                    {[
                      ["S No.", "5%", "center"],
                      ["Medicine Name", "20%", "left"],
                      ["Generic Name", "20%", "left"],
                      ["Dosage", "38%", "left"],
                      ["Duration", "17%", "left"],
                    ].map(([label, width, align]) => (
                      <th
                        key={label}
                        style={{
                          width,
                          padding: "7px 8px",
                          textAlign: align,
                          fontWeight: 700,
                          fontSize: "12px",
                          borderRight: "1px solid #bbb",
                          background: "transparent",
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.medicineInfo.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #ddd",
                        background: "transparent",
                      }}
                    >
                      <td
                        style={{
                          padding: "7px 8px",
                          textAlign: "center",
                          borderRight: "1px solid #ddd",
                          background: "transparent",
                        }}
                      >
                        {idx + 1}.
                      </td>
                      <td
                        style={{
                          padding: "7px 8px",
                          borderRight: "1px solid #ddd",
                          background: "transparent",
                        }}
                      >
                        {item.medicineName}
                      </td>
                      <td
                        style={{
                          padding: "7px 8px",
                          borderRight: "1px solid #ddd",
                          background: "transparent",
                        }}
                      >
                        {item.medicineGeneric || "—"}
                      </td>
                      <td
                        style={{
                          padding: "7px 8px",
                          borderRight: "1px solid #ddd",
                          lineHeight: "1.5",
                          background: "transparent",
                        }}
                      >
                        {item.noOfTimes && item.frequency && (
                          <div>
                            {item.noOfTimes === "1"
                              ? "Once"
                              : item.noOfTimes === "2"
                                ? "Twice"
                                : `${item.noOfTimes} times`}{" "}
                            daily
                          </div>
                        )}
                        {(item.medicationSchedule || item.time) && (
                          <div style={{ color: "#444" }}>
                            (
                            {[item.medicationSchedule, item.time]
                              .filter(Boolean)
                              .join(" ")}
                            )
                          </div>
                        )}
                        {item.dosage && item.unit && (
                          <div style={{ color: "#666", fontSize: "11px" }}>
                            {item.dosage} {item.unit}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "7px 8px",
                          background: "transparent",
                        }}
                      >
                        {item.days}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Footer content ── */}
            <div style={{ marginTop: "18px", fontSize: "13px" }}>
              {/* Test advices */}
              <div style={{ marginBottom: "10px" }}>
                Test advices &ndash;&nbsp;
                <span>{data.testAdvices || "NA"}</span>
              </div>

              {/* Advice indented list */}
              <div style={{ marginBottom: "10px" }}>
                <div>Advice &ndash;</div>
                {adviceItems.map((item, i) => (
                  <div
                    key={i}
                    style={{ marginLeft: "24px", lineHeight: "1.7" }}
                  >
                    {item}
                  </div>
                ))}
                {data.notes && (
                  <div style={{ marginLeft: "24px", lineHeight: "1.7" }}>
                    {data.notes}
                  </div>
                )}
              </div>

              {/* Sign-off row: stamp+sig left | doctor block right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: "24px",
                }}
              >
                {/* Stamp + signature images */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-end",
                  }}
                >
                  {stampUrl && (
                    <Image
                      src={stampUrl}
                      alt="Doctor Stamp"
                      width={90}
                      height={60}
                      style={{ mixBlendMode: "multiply" }}
                    />
                  )}
                  {signatureUrl && (
                    <Image
                      src={signatureUrl}
                      alt="Doctor Signature"
                      width={90}
                      height={60}
                      style={{ mixBlendMode: "multiply" }}
                    />
                  )}
                  {signNstampLoader && <CircleLoader />}
                </div>

                {/* Doctor sign-off */}
                <div style={{ textAlign: "right", lineHeight: "1.6" }}>
                  <div style={{ fontWeight: 700, color: G, fontSize: "14px" }}>
                    Dr. {data.doctorName}
                  </div>
                  <div style={{ color: G, fontSize: "13px" }}>
                    General Physician
                  </div>
                  <div style={{ color: G, fontSize: "13px" }}>
                    DMC-&nbsp;{data.doctorRegNo || "—"}
                  </div>
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
