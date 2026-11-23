// DocPrescriptionGeneratePdf.js
import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "react-bootstrap";
import { api, style_schema, color_schema, contact_no, imageBlurDataUrl } from "../../../constant";
import Preloader from "../../Preloader";
import Image from "next/image";
import { capitalize, formatData } from "../utils/helper";
import CircleLoader from "../../circleLoader";
import { sendPrescriptionToFirebase } from "../../../utils";
import { stampDataUrl, drawStampOnPdf } from "./DoctorStampGenerator";
import { hasAdviceContent, sanitizeAdviceHtml } from "./adviceHtml";
import { doctorDisplayName } from "../../../utils/doctorName";
import { AiOutlineGlobal } from "react-icons/ai";
import { MdEmail, MdPhone } from "react-icons/md";

/**
 * STANDARD PRESCRIPTION FORMAT (applies to every doctor profile, existing and
 * newly added). The sheet is printed in this exact block order so that the PDF
 * always matches the on-screen form in `prescriptionComp.js`:
 *
 *   1. Green header bar + HealthPath watermark
 *   2. Logo (left) + doctor identity (right) — degree comes from the doctor's
 *      `educationTraining`; this header's own registration line is only printed
 *      when the profile carries a `doctorRegistrationNo` (no hard-coded fallback)
 *   2b. The stamp below repeats the same identity as three blue lines:
 *      name / area of expertise / `Reg. No:` (`lib/DoctorStampGenerator.js`).
 *      The stamp's registration row is compulsory, so it prints for every
 *      profile and reads `Reg. No: Not provided` until the number is filled in -
 *      unlike the header line in 2 above, which stays hidden while it is blank.
 *   3. Patient details (left) + date (right)
 *   4. History — HOPI / provisional diagnosis, known case / known allergy
 *   5. Rx mark + Medicines table
 *   6. Diagnosis & advice (Advice + Notes)
 *   7. Test advices
 *   8. Signature + stamp
 *   8b. Disclaimer — 5 legal points in a pale company-gold box (replaced the old
 *      single "Not For Medico Legal Purpose" line)
 *   9. Footer (website / email / phone)
 *
 * Keep this order here only: this one component renders the prescription for
 * all doctors, so no per-doctor template exists or should be introduced.
 */

const PDF_WIDTH = 720; // design width of #pdfContainer (px)
const A4_WIDTH_MM = 210; // A4 width in mm - used to map DOM rects into PDF units

// Where the stamp/signature go if a DOM rect can't be measured for any reason.
const STAMP_FALLBACK_MM = { x: 150, y: 248, w: 45, h: 27 };
const SIGNATURE_FALLBACK_MM = { x: 150, y: 222, w: 42, h: 25 };

// Section labels on the sheet (Patient id / HOPI / Known Case of / Provisional
// diagnosis / History of known allergy / Advice / Test advices) print bold, so
// they stay readable on a printed or scanned copy of the prescription.
const LABEL_WEIGHT = 700;

// Legal disclaimer printed at the foot of every prescription. It replaced the
// single "Not For Medico Legal Purpose" line, which is now its last point.
const PRESCRIPTION_DISCLAIMER = [
  "The information and advice provided here is provisional in nature as it is based on the limited information made available by the patient.",
  "The patient is advised to visit in person for thorough examination at the earliest.",
  "The information is confidential in nature and for recipient's use only.",
  "The Prescription is generated on a Teleconsultation.",
  "Not valid for medico-legal purpose.",
];

// Company gold (#916f38) at a light tint - the box the disclaimer prints in.
const DISCLAIMER_BG = "#fdf6e4";
const DISCLAIMER_BORDER = "#e3cf9f";
const DISCLAIMER_TEXT = "#6b5526";

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

  // The patient's copy is only released signed: `signPrescription` fetches the
  // signature and draws the stamp, so while either is missing they are the two
  // gates that keep Send / Download locked.
  const isSigned = Boolean(signatureUrl && stampUrl);

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
      // The stamp shows the doctor's primary speciality (`expertise`), not the
      // joined `serviceOffered` list used by the sheet header above.
      specialization: data.doctorExpertise || "",
      // The stamp's Reg. No row is compulsory: `DoctorStampGenerator` prints the
      // number here or its "Not provided" placeholder - never a borrowed number.
      regNo: data.doctorRegNo || "",
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
        // Exactly the three fields of the on-screen stamp above; a blank `regNo`
        // makes the generator print its "Not provided" row, never a fake number.
        name: data.doctorName,
        specialization: data.doctorExpertise || "",
        regNo: data.doctorRegNo || "",
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
    if (!isSigned) {
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
    if (!isSigned) {
      window.alert("Please sign the prescription before sending.");
      return;
    }
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
          name: data.patientName || "",
          prescriptionDetails: {
            doctorId: data.doctorId,
            doctorName: data.doctorName,
            doctorPhone: data.doctorMobNo,
            doctorRegistrationNo: data.doctorRegNo,
            doctorSpeciality: data.doctorSepecialization,
            doctorStampUrl: data.doctorStampUrl,
            doctorSignatureUrl: data.doctorSignatureUrl,
            patientId: data.patientId,
            patientName: data.patientName,
            patientAge: data.age,
            patientGender: data.gender,
            patientPhone: data.patientNo,
            chiefComplaints: data.cheifCompalaints,
            diagnosis: data.provisionalDiagnosis,
            medicalHistory: data.knownCases,
            allergies: data.anyDrugAllergy,
            medicines: data.medicineInfo,
            tests: data.testAdvices,
            advice: data.advices,
            notes: data.notes,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // The appointment only becomes COMPLETED when the message really went
        // out, so never tell the doctor "sent" on a failed delivery.
        if (result.sent) {
          window.alert("Prescription sent successfully.");
        } else {
          window.alert(
            "Prescription saved, but the WhatsApp message could not be delivered. The appointment is still open.",
          );
        }
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

  // The advice box is a small rich-text field (bold / underline / tables), so it
  // is stored as `advicesHtml` and printed as HTML - html2canvas captures the
  // sheet, so nothing has to be re-drawn for the PDF. `advices` (plain text) is
  // still the fallback for data saved before the editor existed, and the empty
  // tables a doctor inserted but never filled in are dropped here.
  const adviceHtml = sanitizeAdviceHtml(data.advicesHtml || "", {
    dropEmptyTables: true,
  });
  const showRichAdvice = hasAdviceContent(adviceHtml);

  // The Notes box uses the same rich field, so it prints the same way (and the
  // plain `notes` string stays the fallback for older saved data / JSON APIs).
  const notesHtml = sanitizeAdviceHtml(data.notesHtml || "", {
    dropEmptyTables: true,
  });
  const showRichNotes = hasAdviceContent(notesHtml);

  const BORDER = "1px solid #aaa";
  const BOLD_BORDER = "2px solid #555";
  const GREEN = color_schema.green;

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
      {/* Rich advice markup comes from the doctor's editor, so its table/list
          styling lives here instead of inline styles on the injected HTML.
          html2canvas reads the computed styles, so preview === PDF. */}
      <style>{`
        .rx-advice-rich p,
        .rx-advice-rich div {
          margin: 0;
        }
        .rx-advice-rich ul,
        .rx-advice-rich ol {
          margin: 0 0 0 18px;
          padding: 0;
        }
        .rx-advice-rich table {
          width: 100%;
          max-width: 100%;
          margin: 6px 0;
          font-size: 13px;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .rx-advice-rich th,
        .rx-advice-rich td {
          padding: 4px 6px;
          vertical-align: top;
          border: 1px solid #aaa;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
      `}</style>


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
                color: "rgba(59,95,29,0.08)",
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
                color: "rgba(210,185,150,0.10)",
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
              {/* Intrinsic 893x828; the props carry the real ratio so `height:
                  auto` keeps the logo at 180x167 like the original <img> did.
                  (height={300} + CSS width only made next/image print a 300px
                  tall, stretched logo that pushed the whole sheet down.) */}
              <Image
                src="/images/Doctor/prescriptionlogo.jpg"
                alt="HealthPath Logo"
                width={893}
                height={828}
                priority={false}
                loading="lazy"
                style={{
                  width: "180px",
                  height: "auto",
                  display: "block",
                  mixBlendMode: "multiply",
                }}
              />
              <div style={{ textAlign: "right", lineHeight: "1.5" }}>
                <div
                  style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}
                >
                  {doctorDisplayName(capitalize(data.doctorName))}
                </div>
                <div style={{ fontSize: "15px", color: "#222" }}>
                  {data.doctorSepecialization
                    ? data.doctorSepecialization.split(",")[0].trim()
                    : "Family Physician"}
                </div>
                {data.doctorRegNo && (
                  <div style={{ fontSize: "15px", color: "#222" }}>
                    Reg no : {data.doctorRegNo}
                  </div>
                )}
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
                <div>
                  <span style={{ fontWeight: LABEL_WEIGHT }}>Patient id:</span>
                  &nbsp;{data.patientId}
                </div>
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
                <div style={{ fontWeight: LABEL_WEIGHT }}>
                  HOPI (History of present illness)
                </div>
                <div style={{ marginBottom: "8px" }}>
                  {data.cheifCompalaints || "—"}
                </div>
                <div style={{ fontWeight: LABEL_WEIGHT }}>Provisional diagnosis</div>
                <div>
                  {data.provisionalDiagnosis || data.underTreatmentSince || "—"}
                </div>
              </div>
              <div style={{ flex: 1, paddingLeft: "20px", lineHeight: "1.6" }}>
                <div style={{ fontWeight: LABEL_WEIGHT }}>Known Case of</div>
                <div style={{ marginBottom: "8px" }}>
                  {data.knownCases || "NA"}
                </div>
                <div style={{ fontWeight: LABEL_WEIGHT }}>History of known allergy</div>
                <div>{data.anyDrugAllergy || "NA"}</div>
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                5. RX ICON ROW
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div style={{ marginTop: "8px", marginBottom: "4px" }}>
              {/* 512x512 source, printed at 34x34. Both dimensions must be set:
                  next/image emits the width/height props as HTML attributes, so a
                  CSS width alone left the 300px attribute height in place and the
                  mark stretched into a full-page-height black strip. */}
              <Image
                src="/images/Doctor/RXIcon.png"
                alt="Rx"
                width={34}
                height={34}
                priority={false}
                loading="lazy"
                style={{
                  width: "34px",
                  height: "34px",
                  display: "block",
                  mixBlendMode: "multiply",
                }}
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
                        // Opaque header: the centred page watermark sits behind
                        // this row, so a transparent header made the column
                        // labels unreadable.
                        background: "#fff",
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
              {/* Left: diagnosis & advice, then test advices — the same order as
                  the on-screen form and the standard block order documented at
                  the top of this file (every doctor profile prints this). */}
              <div style={{ flex: 1, paddingRight: "16px" }}>
                <div style={{ fontWeight: LABEL_WEIGHT }}>Advice &ndash;</div>
                {showRichAdvice ? (
                  <div
                    className="rx-advice-rich"
                    style={{
                      marginLeft: "20px",
                      lineHeight: "1.7",
                      // A long unbroken word or a wide table can never push the
                      // sheet past A4 - it wraps/shrinks inside this column.
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                    // Sanitised above: whitelist-only markup, no styles/handlers.
                    dangerouslySetInnerHTML={{ __html: adviceHtml }}
                  />
                ) : (
                  adviceItems.map((item, i) => (
                    <div
                      key={i}
                      style={{ marginLeft: "20px", lineHeight: "1.7" }}
                    >
                      {item}
                    </div>
                  ))
                )}
                {showRichNotes ? (
                  <div
                    className="rx-advice-rich"
                    style={{
                      marginLeft: "20px",
                      lineHeight: "1.7",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                    // Sanitised above, exactly like the advice block.
                    dangerouslySetInnerHTML={{ __html: notesHtml }}
                  />
                ) : (
                  data.notes && (
                    <div style={{ marginLeft: "20px", lineHeight: "1.7" }}>
                      {data.notes}
                    </div>
                  )
                )}
                <div style={{ marginTop: "8px" }}>
                  <span style={{ fontWeight: LABEL_WEIGHT }}>Test advices</span>
                  &nbsp;&ndash;&nbsp;
                  <span>
                    {Array.isArray(data.testAdvices)
                      ? data.testAdvices.filter(Boolean).join(", ") || "NA"
                      : data.testAdvices?.trim() || "NA"}
                  </span>
                </div>
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
                      placeholder="blur"
                      blurDataURL={imageBlurDataUrl}
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
                      placeholder="blur"
                      blurDataURL={imageBlurDataUrl}
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
                8. DISCLAIMER — the legal points, in the company's light yellow
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div
              style={{
                marginTop: "10px",
                padding: "7px 10px 8px",
                backgroundColor: DISCLAIMER_BG,
                border: `1px solid ${DISCLAIMER_BORDER}`,
                borderRadius: "3px",
                fontSize: "9px",
                lineHeight: "1.45",
                color: DISCLAIMER_TEXT,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontWeight: LABEL_WEIGHT,
                  fontSize: "10px",
                  marginBottom: "3px",
                }}
              >
                Disclaimer
              </div>
              <ol style={{ margin: 0, paddingLeft: "14px" }}>
                {PRESCRIPTION_DISCLAIMER.map((point) => (
                  <li key={point} style={{ marginBottom: "1px" }}>
                    {point}
                  </li>
                ))}
              </ol>
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
            {/* Patient-facing sheet: the customer-support number, not the
                staff/doctor helpline (that one lives in the doctor panel). */}
            <span>
              <MdPhone size={23} /> {contact_no}
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
          disabled={loading || !isSigned}
          title={isSigned ? undefined : "Sign the prescription first"}
          style={{ backgroundColor: color_schema.yellow, border: "none" }}
        >
          <strong>{loading ? "Sending..." : "Send PDF"}</strong>
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={loading || !isSigned}
          title={isSigned ? undefined : "Sign the prescription first"}
          style={{ backgroundColor: "#3a5e1c", border: "none" }}
        >
          <strong>Download PDF</strong>
        </Button>
        <Button
          onClick={signPrescription}
          disabled={loading || signNstampLoader}
          style={{ backgroundColor: color_schema.yellow, border: "none" }}
        >
          <strong>{signNstampLoader ? "Signing..." : "Sign PDF"}</strong>
        </Button>
      </div>

      {/* Send / Download stay locked until the signature and stamp are on the sheet. */}
      {!isSigned && (
        <div
          style={{
            fontSize: "13px",
            color: "#8a6d3b",
            textAlign: "center",
            padding: "0 16px 16px",
          }}
        >
          {!data.doctorSignatureUrl ? (
            <>
              No signature is saved on your profile yet &mdash; add your
              signature under Profile, then sign and send this prescription.
            </>
          ) : (
            <>
              Sign the prescription first &mdash; without the signature and stamp
              it can neither be sent nor downloaded.
            </>
          )}
        </div>
      )}

      <Preloader show={loading} />
    </div>
  );
};

export default DocPrescriptionGeneratePdf;
