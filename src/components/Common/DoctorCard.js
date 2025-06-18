import React from "react";
import styles from "./css/ViewDoctorListComp.module.css";
import Image from "next/image";

const DoctorCard = ({ doctor, index }) => {
  return (
    <div key={index} className={styles["new-doctor-card"]}>
      {/* Left Section */}
      <div className={styles["doctor-details-section row"]}>
        <div className={styles["doctor-profile-pic-container col"]}>
          <div className="d-flex justify-content-center align-items-center">
            <Image
              width={170}
              height={170}
              src={
                doctor.profilePictureUrl ||
                `https://placehold.co/100x100/EBF8FF/3498DB?text=${doctor.name.charAt(
                  0
                )}`
              }
              alt={doctor.name}
              className={styles["doctor-profile-pic"]}
            />
          </div>
          <div className={`mt-2 ${styles["view-profile-link"]}`}>View Profile</div>
        </div>

        <div className={`mt-4 ${styles["doctor-primary-info col"]}`}>
          <h2 className={styles["new-doctor-name mt-4"]}>{doctor.name}</h2>
          <p className={styles["doctor-text"]}>{doctor.speciality}</p>
          <p className={styles["doctor-text"]}>
            {doctor.workExperience} experience overall
          </p>
          <p className={styles["doctor-text"]}>
            <span className={styles["location-highlight"]}>
              {/* {doctor.location} */}
            </span>{" "}
          </p>
          <p className={styles["doctor-text"]}>₹{doctor.price} fee</p>
          <div className={styles["patient-stories"]}>
            <div className={styles["thumbs-up-container"]}>
              <span className={styles["percentage"]}>96%</span>
              <a href="#reviews" className={styles["patient-stories-link"]}>
                {doctor.reviews} Patient Stories
              </a>
            </div>

            <div className={styles["availability-info"]}>
              <span className={styles["calendar-icon"]}>📅</span> Available
              Today
            </div>
          </div>
        </div>
        <div className={`${styles["doctor-booking-section"]} text-center`}>
          <button
            className={`btn btn-primary ${styles["new-book-btn"]} ${styles["primary"]} mt-3`}
          >
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
