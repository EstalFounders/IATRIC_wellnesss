import React from "react";
import DoctorCard from "./DoctorCard";
import styles from "./css/ViewDoctorListComp.module.css"

const ViewDoctorListComp = ({ doctors }) => {
  return (
    <div className={styles["view-doctor-list-container"]}>
      {/* An empty array is truthy, so `doctors ?` never reached the fallback and
          a speciality without a doctor rendered a silently blank section. */}
      {doctors?.length ? (
        doctors.map((doctor, index) => (
          <DoctorCard doctor={doctor} index={index} key={doctor._id} />
          
        ))
      ) : (
        <p className={styles["no-doctors-found"]}>No doctors available</p>
      )}
    </div>
  );
};

export default ViewDoctorListComp;
