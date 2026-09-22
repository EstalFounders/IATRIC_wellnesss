// DocPrescriptionGeneratePdf.js
import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "react-bootstrap";
import { api, style_schema } from "../../../constant";
import Preloader from "../../Preloader";
import Image from "next/image";
import { capitalize, formatData } from "../utils/helper";
import CircleLoader from "../../circleLoader";
import { sendPrescriptionToFirebase } from "../../../utils";
import { stampDataUrl, drawStampOnPdf } from "./DoctorStampGenerator";
import { AiOutlineGlobal } from "react-icons/ai";
import { MdEmail, MdPhone } from "react-icons/md";

const PDF_WIDTH = 720; // design width of #pdfContainer (px)
const A4_WIDTH_MM = 210; // A4 width in mm - used to map DOM rects into PDF units

// Where the stamp/signature go if a DOM rect can't be measured for any reason.
const STAMP_FALLBACK_MM = { x: 150, y: 248, w: 45, h: 27 };
const SIGNATURE_FALLBACK_MM = { x: 150, y: 222, w: 42, h: 25 };

// Map an element's on-screen box to millimetres relative to the print container.
const getMmRect = (node, container) => {
  if (!node || !container) return null;
  const c = container.getBoundingClientRect();
  const r = node.getBoundingClientRect();
  if (!c.width || !r.width || !r.height) return null;
  const scale = A4_WIDTH_MM / c.width;
  return {
    x: (r.left - c.left) * scale,
    y: (r.top - c.top) * scale,
    w: r.width * scale,
    h: r.height * scale,
  };
};

// Never capture before images finish loading - on mobile a slow blob would come out blank.
const waitForImages = async (root) => {
  if (!root) return;
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map((img) =>
      img.decode
        ? img.decode().catch(() => {})
        : Promise.resolve()
    )
  );
};

// Turn a signature scan into a PNG with the white paper knocked out, so the PDF looks
// the same as the preview's `mix-blend-mode: multiply` on every PDF viewer.
const urlToTransparentPngDataUrl = (url) =>
  new Promise((resolve) => {
    if (!url || typeof document === "undefined") return resolve(null);
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < data.data.length; i += 4) {
          const luminance =
            (data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3;
          if (luminance > 235) {
            data.data[i + 3] = 0; // pure paper -> fully transparent
          } else if (luminance > 200) {
            data.data[i + 3] = Math.round(
              data.data[i + 3] * (1 - (luminance - 200) / 35)
            );
          }
        }
        ctx.putImageData(data, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        console.warn("Signature transparency pass failed:", error);
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });

const DocPrescriptionGeneratePdf = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [signNstampLoader, setSignNstampLoader] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [signaturePng, setSignaturePng] = useState(null);
  const [stampUrl, setStampUrl] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);

  // DOM anchors used to place the vector stamp / transparent signature in the PDF.
  const stampRef = useRef(null);
  const signatureRef = useRef(null);

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
            await setter(URL.createObjectURL(blob));
          }
        } catch (error) {
          console.error(`Error fetching image:`, error);
        } finally {
          setSignNstampLoader(false);
        }
      } else {
        setter(null);
      }
    };

    if (data.doctorSignatureUrl) {
      fetchImage(data.doctorSignatureUrl, async (url) => {
        setSignatureUrl(url);
        setSignaturePng(await urlToTransparentPngDataUrl(url));
      });
    }

    const dynamicStampUrl = stampDataUrl({
      name: data.doctorName,
      degree: data.doctorDegree,
      dmcNo: data.doctorRegNo || "101542",
    });
    setStampUrl(dynamicStampUrl);
    setSignNstampLoader(false);

    return () => {
      if (signatureUrl) URL.revokeObjectURL(signatureUrl);
    };
  };

  const generateCanvas = async () => {
    const element = document.getElementById("pdfContainer");
    const originalTransform = element.style.transform;
    element.style.transform = "none";

    // Wait for every image so a slow-loading signature/stamp is never captured blank.
    await waitForImages(element);

    // Rect measurement happens with the mobile preview transform removed, so the
    // millimetre mapping matches the captured (untransformed) layout exactly.
    const stampRect = getMmRect(stampRef.current, element);
    const signatureRect = getMmRect(signatureRef.current, element);

    // Hide the DOM copies: the PDF gets a crisp vector stamp + pre-multiplied
    // signature instead (html2canvas clips/mis-sizes <img> SVGs and ignores
    // mix-blend-mode, which is what made the stamp look cut off).
    const hidden = [];
    [stampRef.current, signatureRef.current].forEach((node) => {
      if (node) {
        hidden.push([node, node.style.visibility]);
        node.style.visibility = "hidden";
      }
    });

    let canvas;
    try {
      canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: PDF_WIDTH,
        scrollY: -window.scrollY,
      });
    } finally {
      hidden.forEach(([node, previous]) => {
        node.style.visibility = previous;
      });
      element.style.transform = originalTransform;
    }

    return { canvas, stampRect, signatureRect };
  };

  const canvasToSinglePagePDF = (canvas, rects = {}) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pdfWidth = A4_WIDTH_MM;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    const finalHeight = imgHeight > pageHeight ? pageHeight : imgHeight;
    doc.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      pdfWidth,
      finalHeight,
    );

    // ── Stamp: drawn as real PDF vectors, positioned from the DOM rect ──────────
    // Immune to the raster-capture sizing/clipping that hit the SVG <img>.
    const stampBox = rects.stampRect || STAMP_FALLBACK_MM;
    drawStampOnPdf(
      doc,
      {
        name: data.doctorName,
        degree: data.doctorDegree,
        dmcNo: data.doctorRegNo || "101542",
      },
      stampBox.x,
      stampBox.y,
      stampBox.w,
      stampBox.h,
    );

    // ── Signature: PNG with the white paper already knocked out ────────────────
    if (signaturePng) {
      const sigBox = rects.signatureRect || SIGNATURE_FALLBACK_MM;
      doc.addImage(signaturePng, "PNG", sigBox.x, sigBox.y, sigBox.w, sigBox.h);
    }

    return doc;
  };

  const handleDownloadPDF = async () => {
    if (!signatureUrl || !stampUrl) {
      window.alert("Please sign the prescription before downloading.");
      return;
    }
    setLoading(true);
    try {
      const { canvas, stampRect, signatureRect } = await generateCanvas();
      const doc = canvasToSinglePagePDF(canvas, { stampRect, signatureRect });
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
      const { canvas, stampRect, signatureRect } = await generateCanvas();
      const doc = canvasToSinglePagePDF(canvas, { stampRect, signatureRect });
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
          patientNo: data.patientNo || "",
        }),
      });

      if (response.ok) {
        window.alert("Prescription sent successfully.");
      } else {
        window.alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("PDF generation/upload error:", error.message);
      window.alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const adviceItems = data.advices
    ? String(data.advices)
        .split(/[,\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const BORDER = "1px solid #aaa";
  const BOLD_BORDER = "2px solid #555";
  const GREEN = "#3b5f1d";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        fontFamily: style_schema.font_family || "TT Ramillas, serif",
      }}
    >
      {/* Scaled preview wrapper */}
      <div
        style={{
          width: `${PDF_WIDTH * previewScale}px`,
          height: "auto",
          overflow: "visible",
          boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
        }}
      >
        <div
          id="pdfContainer"
          style={{
            transformOrigin: "top left",
            transform: `scale(${previewScale})`,
            width: `${PDF_WIDTH}px`,
            height: "auto",
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              1. TOP GREEN HEADER BAR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div
            style={{ height: "12px", backgroundColor: GREEN, width: "100%" }}
          />

          {/* WATERMARK — absolute, covers full page */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              userSelect: "none",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <div
              style={{
                fontSize: "92px",
                fontWeight: 900,
                color: "rgba(59,95,29,0.2)",
                fontFamily: "Georgia, serif",
                letterSpacing: "-2px",
                lineHeight: 1,
              }}
            >
              HealthPath
            </div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "rgba(210,185,150,0.2)",
                fontFamily: "Georgia, serif",
                marginTop: "4px",
              }}
            >
              Your path to healthy living
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              MAIN CONTENT (above watermark)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div style={{ position: "relative", zIndex: 1, padding: "0 32px" }}>
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                2. LOGO (left) + DOCTOR INFO (right)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                // padding: "14px 0 14px 0",
              }}
            >
              <img
                src="/images/Doctor/prescriptionlogo.jpg"
                alt="HealthPath Logo"
                style={{ width: "180px", mixBlendMode: "multiply" }}
              />
              <div style={{ textAlign: "right", lineHeight: "1.5" }}>
                <div
                  style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}
                >
                  Dr.{capitalize(data.doctorName)}
                </div>
                <div style={{ fontSize: "15px", color: "#222" }}>
                  {data.doctorSepecialization
                    ? data.doctorSepecialization.split(",")[0].trim()
                    : "Family Physician"}
                </div>
                <div style={{ fontSize: "15px", color: "#222" }}>
                  Reg no : {data.doctorRegNo || "101542"}
                </div>
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                3. PATIENT DETAILS (left) + DATE (right)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                // borderTop: BOLD_BORDER,
                borderBottom: BOLD_BORDER,
                padding: "8px 0",

                fontSize: "15px",
              }}
            >
              <div style={{ lineHeight: "1.6" }}>
                <div>Patient id:&nbsp;{data.patientId}</div>
                <div>
                  {data.patientName}&nbsp;,&nbsp;{data.age}&nbsp;yr&nbsp;,&nbsp;
                  {data.gender ? data.gender.slice(0, 1).toUpperCase() : ""}
                </div>
              </div>
              <div style={{ fontSize: "15px" }}>{formatData(new Date())}</div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                4. ILLNESS / ALLERGY 2-COLUMN ROW
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div
              style={{
                display: "flex",
                marginTop: "10px",
                paddingBottom: "10px",
                borderBottom: BORDER,
                fontSize: "15px",
              }}
            >
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
              <div style={{ flex: 1, paddingLeft: "20px", lineHeight: "1.6" }}>
                <div style={{ fontWeight: 500 }}>Known Case of</div>
                <div style={{ marginBottom: "8px" }}>
                  {data.knownCases || "NA"}
                </div>
                <div style={{ fontWeight: 500 }}>History of known allergy</div>
                <div>{data.anyDrugAllergy || "NA"}</div>
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                5. RX ICON ROW
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div style={{ marginTop: "8px", marginBottom: "4px" }}>
              <img
                src="/images/Doctor/RXIcon.png"
                alt="Rx"
                style={{ width: "34px", mixBlendMode: "multiply" }}
              />
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                6. MEDICINE TABLE
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #bbb",
                fontSize: "14px",
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
                        padding: "5px 8px",
                        textAlign: align,
                        fontWeight: 700,
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
                  <tr key={idx} style={{ background: "transparent" }}>
                    <td
                      style={{
                        padding: "5px 8px",
                        textAlign: "center",
                        background: "transparent",
                      }}
                    >
                      {idx + 1}.
                    </td>
                    <td
                      style={{ padding: "5px 8px", background: "transparent" }}
                    >
                      {item.medicineName}
                    </td>
                    <td
                      style={{ padding: "5px 8px", background: "transparent" }}
                    >
                      {item.medicineGeneric || "—"}
                    </td>
                    <td
                      style={{
                        padding: "5px 8px",
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
                        <div style={{ color: "#666", fontSize: "13px" }}>
                          {item.dosage} {item.unit}
                        </div>
                      )}
                    </td>
                    <td
                      style={{ padding: "5px 8px", background: "transparent" }}
                    >
                      {item.days} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                7. TEST ADVICE + ADVICE (left) | SIGN + STAMP (right)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginTop: "16px",
                fontSize: "15px",
                paddingBottom: "16px",
              }}
            >
              {/* Left: test advice + advice list */}
              <div style={{ flex: 1, paddingRight: "16px" }}>
                <div style={{ marginBottom: "8px" }}>
                  Test advices &ndash;&nbsp;
                  <span>
                    {Array.isArray(data.testAdvices)
                      ? data.testAdvices.filter(Boolean).join(", ") || "NA"
                      : data.testAdvices?.trim() || "NA"}
                  </span>
                </div>
                <div>Advice &ndash;</div>
                {adviceItems.map((item, i) => (
                  <div
                    key={i}
                    style={{ marginLeft: "20px", lineHeight: "1.7" }}
                  >
                    {item}
                  </div>
                ))}
                {data.notes && (
                  <div style={{ marginLeft: "20px", lineHeight: "1.7" }}>
                    {data.notes}
                  </div>
                )}
              </div>

              {/* Right: signature + stamp */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "8px",
                  minWidth: "110px",
                }}
              >
                {signNstampLoader && <CircleLoader />}
                {signatureUrl && (
                  <div ref={signatureRef} style={{ lineHeight: 0 }}>
                    <Image
                      src={signatureUrl}
                      alt="Doctor Signature"
                      width={100}
                      height={65}
                      style={{ mixBlendMode: "multiply" }}
                    />
                  </div>
                )}
                {stampUrl && (
                  <div ref={stampRef} style={{ lineHeight: 0 }}>
                    <Image
                      src={stampUrl}
                      alt="Doctor Stamp"
                      width={100}
                      height={65}
                      style={{ mixBlendMode: "multiply" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                8. FOOTER — website / email / phone
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div
              style={{
                borderBottom: BORDER,
                paddingTop: "10px",
                paddingBottom: "8px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              Not For Medico Legal Purpose
            </div>
          </div>
          {/* end main content */}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              9. BOTTOM GREEN FOOTER BAR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div
            style={{
              // backgroundColor: GREEN,
              color: "#8c8686",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              padding: "10px 0px",
              fontSize: "16px",
              fontWeight: "bold",
              gap: "12px",
            }}
          >
            <span>
              <AiOutlineGlobal size={23} />
              www.healthpath.co.in
            </span>
            <span>
              <MdEmail size={23} /> customercare@healthpath.co.in
            </span>
            <span>
              <MdPhone size={23} /> +91 84485 59925
            </span>
          </div>
          <div
            style={{ height: "12px", backgroundColor: GREEN, width: "100%" }}
          />
        </div>
        {/* end pdfContainer */}
      </div>
      {/* end preview wrapper */}

      {/* Action buttons */}
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

      <Preloader show={loading} />
    </div>
  );
};

export default DocPrescriptionGeneratePdf;
