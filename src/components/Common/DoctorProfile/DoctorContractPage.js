// DoctorContractPage.js
// Read-only "Contract" page in the doctor panel (pages/registerDoc/contract.js).
//
// It is a record, not a form: the hire details, every document that is on file
// and the degrees that print on the prescription are rendered exactly as they
// are stored on the doctor document. Nothing on this page writes - there is no
// upload, no document replace and no delete - because a contract is only ever
// changed by the super admin. The single action hands the doctor over to
// /registerDoc/profile, whose save flow puts the changed fields into the super
// admin's approval queue (lib/doctorProfileSubmit.js ->
// POST /api/registerDoc/doctorUpdateReq).
//
// The record comes from the doctor-panel session blob (lib/doctorProfileSession),
// so the page needs no request of its own; "Refresh" re-reads the same session
// and, when the blob carries an `_id`, re-fetches the approved document from
// /api/addDoctor (read-only) so an approval shows up without signing in again.
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FaExternalLinkAlt,
  FaFileContract,
  FaFolderOpen,
  FaGraduationCap,
  FaHeadset,
  FaPen,
} from "react-icons/fa";
import { api, staff_support_email, staff_support_no } from "../../../constant";
import { convertDateIntoTime } from "../../../helper";
import {
  formatEducationTrainingLabel,
  parseEducationTraining,
} from "../../../customUtils/educationTraining";
import { formatLanguagesLabel } from "../../../customUtils/languages";
import { formatWorkDaysLabel } from "../../../customUtils/workDays";
import { doctorDisplayName } from "../../../utils/doctorName";
import { readSessionDoctor } from "./lib/doctorProfileSession";
import styles from "./DoctorContract.module.css";

const DOCTOR_PANEL_ROUTE = "/registerDoc/homepage";
const PROFILE_ROUTE = "/registerDoc/profile";
const NOT_ON_FILE = "Not on file";
const CHANGE_NOTE =
  "Changes are sent to the super admin and applied once approved.";

/* ── Read-only formatting (never rewritten, only displayed) ─────────────── */

/** `joiningDate` / `slotStartTime` are Dates; "" when missing or invalid. */
const formatDay = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/** Both slot bounds are full Dates; only the clock part is meaningful. */
const formatSlotWindow = (doctor) => {
  const from = doctor.slotStartTime ? convertDateIntoTime(doctor.slotStartTime) : "";
  const to = doctor.slotEndTime ? convertDateIntoTime(doctor.slotEndTime) : "";
  if (!from && !to) return "";
  return `${from || "?"} – ${to || "?"}`;
};

const formatPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return `₹ ${amount.toLocaleString("en-IN")}`;
};

const formatShare = (value) => {
  const share = Number(value);
  if (!Number.isFinite(share) || share <= 0) return "";
  return `${share}%`;
};

/** `consultationType` / `language` are arrays, legacy rows may be Strings. */
const joinList = (value) =>
  Array.isArray(value) ? value.filter(Boolean).join(" · ") : value || "";

/** Every document the profile holds, in the order the page shows them. */
const buildDocuments = (doctor) => {
  const documents = [];

  if (doctor.profilePictureUrl) {
    documents.push({
      key: "profilePicture",
      label: "Profile photo",
      url: doctor.profilePictureUrl,
    });
  }

  const certificates = Array.isArray(doctor.diplomasCertificatesUrls)
    ? doctor.diplomasCertificatesUrls.filter(Boolean)
    : [];

  certificates.forEach((url, index) => {
    documents.push({
      key: `certificate-${index}`,
      label: certificates.length > 1 ? `Certificate ${index + 1}` : "Certificate",
      url,
    });
  });

  if (doctor.doctorStampUrl) {
    documents.push({
      key: "doctorStamp",
      label: "Prescription stamp",
      url: doctor.doctorStampUrl,
    });
  }

  if (doctor.doctorSignatureUrl) {
    documents.push({
      key: "doctorSignature",
      label: "Signature",
      url: doctor.doctorSignatureUrl,
    });
  }

  return documents;
};

/** The "Hiring & contract" facts, in reading order. */
const buildHiringFacts = (doctor) => [
  { label: "Hire date", value: formatDay(doctor.joiningDate) },
  { label: "Doctor type", value: doctor.doctorType },
  { label: "Consultation price", value: formatPrice(doctor.price) },
  {
    label: "Agreed share",
    value: formatShare(doctor.doctorShare),
    hint: "Recorded at hiring - only the super admin can change it.",
  },
  {
    label: "Contract status",
    value:
      doctor.isActive === false
        ? "Inactive - not accepting new bookings"
        : "Active",
  },
  { label: "Work days", value: formatWorkDaysLabel(doctor.workDays) },
  { label: "Slot hours", value: formatSlotWindow(doctor) },
  { label: "Consultation types", value: joinList(doctor.consultationType) },
  { label: "Languages", value: formatLanguagesLabel(doctor.language) },
  { label: "Work experience", value: doctor.workExperience },
  { label: "Area of expertise", value: doctor.expertise },
];

const DoctorContractPage = () => {
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");

  // The panel guard stores the signed-in doctor in sessionStorage before this
  // page renders, so the record is available without a request of its own.
  useEffect(() => {
    setDoctor(readSessionDoctor());
    setLoading(false);
  }, []);

  const goToProfile = useCallback(() => {
    router.push(PROFILE_ROUTE);
  }, [router]);

  const goBack = useCallback(() => {
    router.push(DOCTOR_PANEL_ROUTE);
  }, [router]);

  // Read-only refresh: the session blob is written at sign-in, so an approval
  // made in another tab only shows after the stored document is re-read.
  const handleRefresh = useCallback(async () => {
    setNotice("");

    const sessionDoctor = readSessionDoctor();
    const doctorId = sessionDoctor?._id || sessionDoctor?.id;

    if (!doctorId) {
      setNotice(
        "The session has no doctor id, so the record cannot be refreshed. Please sign in again."
      );
      return;
    }

    setRefreshing(true);
    try {
      const response = await fetch(api.addDoctor);
      const data = await response.json();
      const fresh = Array.isArray(data)
        ? data.find((item) => item._id === doctorId || item.id === doctorId)
        : null;

      if (fresh) setDoctor(fresh);
      setNotice(
        fresh
          ? "Showing the latest approved details."
          : "No approved record was found for this doctor yet."
      );
    } catch (error) {
      console.error("Failed to refresh the contract:", error);
      setNotice("Could not refresh the record. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return <div className={styles.state}>Loading the contract...</div>;
  }

  if (!doctor) {
    return (
      <div className={styles.state}>
        <p>
          We could not read your contract from this session. Please sign in
          again.
        </p>
        <button type="button" className={styles.ghostBtn} onClick={goBack}>
          Go back
        </button>
      </div>
    );
  }

  const documents = buildDocuments(doctor);
  const hiringFacts = buildHiringFacts(doctor);
  const degrees = parseEducationTraining(doctor.educationTraining);
  const degreeLine = formatEducationTrainingLabel(doctor.educationTraining);
  const initial = (doctor.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          {doctor.profilePictureUrl ? (
            <img
              src={doctor.profilePictureUrl}
              alt="Doctor profile"
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {initial || "DR"}
            </div>
          )}
        </div>

        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{doctorDisplayName(doctor.name) || "Unnamed doctor"}</h1>
          {/* Degrees sit directly under the name - the same entries the
              prescription prints. */}
          <p className={styles.heroDegrees}>
            {degreeLine || "No degrees added yet"}
          </p>
          <p className={styles.heroSpeciality}>
            {doctor.expertise || "No expertise set"}
          </p>
          <div className={styles.heroMeta}>
            <span className={styles.metaItem}>
              <strong>Reg. No:</strong>{" "}
              {doctor.doctorRegistrationNo?.trim() || "Not provided"}
            </span>
            <span className={styles.metaItem}>
              <strong>Doctor type:</strong> {doctor.doctorType || "-"}
            </span>
            {formatDay(doctor.joiningDate) ? (
              <span className={styles.metaItem}>
                <strong>Member since:</strong> {formatDay(doctor.joiningDate)}
              </span>
            ) : null}
            <span
              className={`${styles.statusPill} ${
                doctor.isActive === false
                  ? styles.statusInactive
                  : styles.statusActive
              }`}
            >
              {doctor.isActive === false ? "Inactive" : "Active"}
            </span>
          </div>
        </div>
      </div>

      <p className={styles.readOnlyNote}>
        This is a read-only record of your contract. Hire details, documents and
        degrees are maintained by the super admin - nothing on this page can be
        edited, uploaded or deleted.
      </p>

      {notice ? <div className={styles.banner}>{notice}</div> : null}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <FaFileContract /> Hiring &amp; contract
        </h2>
        <dl className={styles.factGrid}>
          {hiringFacts.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt className={styles.factLabel}>{fact.label}</dt>
              <dd className={styles.factValue}>
                {fact.value || NOT_ON_FILE}
                {fact.hint ? (
                  <span className={styles.factHint}>{fact.hint}</span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <FaFolderOpen /> Documents on file
        </h2>
        {documents.length === 0 ? (
          <p className={styles.empty}>No documents are on file yet.</p>
        ) : (
          <div className={styles.docGrid}>
            {documents.map((document) => (
              <figure key={document.key} className={styles.docTile}>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.docThumbLink}
                >
                  <img
                    src={document.url}
                    alt={document.label}
                    className={styles.docThumb}
                  />
                </a>
                <figcaption className={styles.docCaption}>
                  {document.label}
                </figcaption>
                <span className={styles.docBadge}>On file</span>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.docOpen}
                >
                  Open <FaExternalLinkAlt />
                </a>
              </figure>
            ))}
          </div>
        )}
        <p className={styles.hint}>
          Documents are uploaded and replaced by the super admin only. This page
          is display-only: there is no upload, no replace and no delete.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <FaGraduationCap /> Degrees &amp; training
        </h2>
        {degrees.length === 0 ? (
          <p className={styles.empty}>No degrees or training added yet.</p>
        ) : (
          <>
            <ul className={styles.degreeList}>
              {degrees.map((degree, index) => (
                <li key={`${degree}-${index}`} className={styles.degreeItem}>
                  {degree}
                </li>
              ))}
            </ul>
            <p className={styles.hint}>
              Printed on the prescription as: <strong>{degreeLine}</strong>
            </p>
          </>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <FaHeadset /> Need help?
        </h2>
        <p className={styles.hint}>
          For contract queries, document uploads (they are handled by the super
          admin) or any other panel issue, contact the HealthPath team:
        </p>
        <p className={styles.hint}>
          <a
            href={`mailto:${staff_support_email}`}
            style={{ color: "#3b5f1d", fontWeight: 600 }}
          >
            {staff_support_email}
          </a>
          {"  ·  "}
          <a
            href={`tel:${staff_support_no.replace(/\s+/g, "")}`}
            style={{ color: "#3b5f1d", fontWeight: 600 }}
          >
            {staff_support_no}
          </a>
        </p>
      </section>

      <div className={styles.actionBar}>
        <span className={styles.dirtyNote}>{CHANGE_NOTE}</span>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={goToProfile}
        >
          <FaPen /> Request a change
        </button>
      </div>
    </div>
  );
};

export default DoctorContractPage;
