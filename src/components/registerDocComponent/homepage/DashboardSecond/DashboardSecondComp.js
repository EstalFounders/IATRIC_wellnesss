// DashboardSecondComp.js
// The lower half of the doctor home page: the appointments table first, then the
// read-only practice summary (the card that used to be an empty "Doctor's
// Remarks" band). Both are plain props pass-throughs - HomepageComp owns the
// data and the selected filter.
import React from "react";
import AppointmentsTable from "./AppointmentTable";
import PracticeSummary from "./PracticeSummary";
import styles from "../../css/HomePage.module.css";

const DashboardSecondComp = ({
  doctor,
  appointments,
  view,
  onViewChange,
  state,
  onRetry,
}) => (
  <div className={styles.dashboard}>
    <AppointmentsTable
      appointments={appointments}
      view={view}
      onViewChange={onViewChange}
      state={state}
      onRetry={onRetry}
    />
    <PracticeSummary doctor={doctor} />
  </div>
);

export default DashboardSecondComp;
