// components/DoctorListingPreview.js
//
// Step 6, "Listing card" tab: the REAL <DoctorCard /> used by /all-doctors,
// /demo-5 and /who-we-are, rendered in preview mode (its links are inert). What
// the admin approves here is exactly what patients will see.

import React from "react";
import DoctorCard from "../../../Common/DoctorCard";
import styles from "../AddDoctorForm.module.css";

const DoctorListingPreview = ({ doctor }) => (
  <div className={styles.previewCard}>
    <DoctorCard doctor={doctor} preview />
  </div>
);

export default DoctorListingPreview;
