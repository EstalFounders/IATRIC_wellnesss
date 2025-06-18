import React from "react";
import DoctorCard from "./DoctorCard";
import styles from "./css/ViewDoctorListComp.module.css"

const ViewDoctorListComp = ({ doctors }) => {
  console.log("Doctors in ViewDoctorListComp:", doctors, doctors.serviceOffered,' doctors.serviceOffered.consultation');
  return (
    <div className={styles["view-doctor-list-container"]}>
        {console.log("Doctors in ViewDoctorListComp:", doctors.length, ' doctors.length')}
      {doctors ? (
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
