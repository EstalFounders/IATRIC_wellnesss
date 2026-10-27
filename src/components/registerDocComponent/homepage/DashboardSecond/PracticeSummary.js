// PracticeSummary.js
// Replaces the old "Doctor's Remarks" card, which only ever printed "No Remarks
// Found": neither the appointment nor the doctor schema has a remarks field and
// nothing ever wrote one. The space now shows the practice facts a doctor checks
// on the home page.
//
// Every value comes out of the same session blob the hero reads, so this card
// needs no request of its own. The display formatting mirrors
// src/components/Common/DoctorProfile/DoctorContractPage.js (which stays the
// full record); the "Edit profile" button hands over to the page that owns the
// approval flow.
import React from "react";
import { useRouter } from "next/router";
import { FaFileContract } from "react-icons/fa";
import { convertDateIntoTime } from "../../../../helper";
import { formatConsultationTypePrices } from "../../../../utils/consultationFee";
import { formatWorkDaysLabel } from "../../../../customUtils/workDays";
import styles from "../../css/HomePage.module.css";

const CONTRACT_ROUTE = "/registerDoc/contract";
const PROFILE_ROUTE = "/registerDoc/profile";

const NOT_ON_FILE = "Not on file";

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
  const from = doctor.slotStartTime
    ? convertDateIntoTime(doctor.slotStartTime)
    : "";
  const to = doctor.slotEndTime ? convertDateIntoTime(doctor.slotEndTime) : "";
  if (!from && !to) return "";
  return `${from || "?"} – ${to || "?"}`;
};

const PracticeSummary = ({ doctor }) => {
  const router = useRouter();

  const facts = [
    {
      label: "Contract status",
      value: doctor.isActive === false ? "Inactive" : "Active",
    },
    { label: "Joining date", value: formatDay(doctor.joiningDate) },
    { label: "Consultation fee", value: formatConsultationTypePrices(doctor.consultationType) },
    {
      label: "Your share",
      value:
        Number(doctor.doctorShare) > 0 ? `${Number(doctor.doctorShare)}%` : "",
    },
    { label: "Working days", value: formatWorkDaysLabel(doctor.workDays) },
    { label: "Slot window", value: formatSlotWindow(doctor) },
  ];

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>
        <FaFileContract /> Practice summary
      </h2>

      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <dt className={styles.factLabel}>{fact.label}</dt>
            <dd className={styles.factValue}>{fact.value || NOT_ON_FILE}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.factActions}>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => router.push(CONTRACT_ROUTE)}
        >
          View contract
        </button>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => router.push(PROFILE_ROUTE)}
        >
          Edit profile
        </button>
      </div>
    </section>
  );
};

export default PracticeSummary;
