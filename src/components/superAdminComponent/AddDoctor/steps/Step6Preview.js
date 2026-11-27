// steps/Step6Preview.js
//
// Step 6 of 6 - the last look before the doctor goes live. Two tabs: the real
// listing card (the very component /all-doctors renders) and a compact profile
// page preview, plus the facts that end up in the database and the WhatsApp
// message the doctor will receive.

import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import styles from "../AddDoctorForm.module.css";
import StepHeader from "../components/StepHeader";
import DoctorListingPreview from "../components/DoctorListingPreview";
import DoctorProfilePreview from "../components/DoctorProfilePreview";

const Step6Preview = ({ previewDoctor, profilePreviewUrl }) => {
  const [tab, setTab] = useState("listing");

  return (
    <section className={styles.card}>
      <StepHeader
        icon={FaEye}
        title="Preview & submit"
        description="This is what patients will see. Submitting registers the doctor and sends their login details on WhatsApp."
      />

      <div className={styles.tabs} role="tablist" aria-label="Preview mode">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "listing"}
          className={`${styles.tab} ${tab === "listing" ? styles.tabActive : ""}`}
          onClick={() => setTab("listing")}
        >
          Listing card
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          className={`${styles.tab} ${tab === "profile" ? styles.tabActive : ""}`}
          onClick={() => setTab("profile")}
        >
          Profile page
        </button>
      </div>

      <div className={styles.previewGrid} role="tabpanel">
        {tab === "listing" ? (
          <DoctorListingPreview doctor={previewDoctor} />
        ) : (
          <DoctorProfilePreview
            doctor={previewDoctor}
            photoUrl={profilePreviewUrl}
          />
        )}
      </div>

      <ul className={styles.checklist}>
        <li className={styles.checklistItem}>
          <span className={styles.checklistLabel}>
            Login: <strong>{previewDoctor.email || "email missing"}</strong>
          </span>
        </li>
        <li className={styles.checklistItem}>
          <span className={styles.checklistLabel}>
            Temporary password goes to{" "}
            <strong>{previewDoctor.mobileNumber || "mobile missing"}</strong> on
            WhatsApp once you submit.
          </span>
        </li>
      </ul>

      <p className={styles.hint}>
        By registering you confirm the doctor&apos;s details have been verified
        against their registration number and certificates.
      </p>
    </section>
  );
};

export default Step6Preview;
