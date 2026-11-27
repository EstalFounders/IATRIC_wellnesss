// components/StepHeader.js
//
// One line that tells the admin what belongs on this step, so a six-step wizard
// never feels like the old wall of fields with the labels cut off.

import React from "react";
import styles from "../AddDoctorForm.module.css";

const StepHeader = ({ icon: Icon, title, description, children }) => (
  <div className={styles.stepHeader}>
    {Icon ? (
      <span className={styles.stepHeaderIcon} aria-hidden="true">
        <Icon />
      </span>
    ) : null}
    <div>
      <h2 className={styles.stepHeaderTitle}>{title}</h2>
      {description ? (
        <p className={styles.stepHeaderText}>{description}</p>
      ) : null}
      {children}
    </div>
  </div>
);

export default StepHeader;
