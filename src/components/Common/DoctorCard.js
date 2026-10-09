import React from "react";
import styles from "./css/ViewDoctorListComp.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setDoctorInfo } from "../../store/slices/bookingWebsite/allDoctorsPageSlice";
import { ConsultationButton } from "./commonUi";
import { useLanguage } from "../../i18n/LanguageContext";
import { fmt } from "../../i18n/format";
import { doctorDisplayName } from "../../utils/doctorName";

const DoctorCard = ({ doctor, index }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const handleViewProfile = (doctor) => {
    console.log("Doctor ID in handleview profile:", doctor);
    const { doctorSignatureUrl, doctorStampUrl, ...filteredDoctor } = doctor;
    dispatch(setDoctorInfo(filteredDoctor));
    router.push(`/doctor-info`);
  };
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
          <div
            className={`mt-2 ${styles["view-profile-link"]}`}
            onClick={() => handleViewProfile(doctor)}
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
          >
            {t("doctor.viewProfile")}
          </div>
        </div>

        <div className={`mt-4 ${styles["doctor-primary-info col"]}`}>
          <h2 className={styles["new-doctor-name mt-4"]}>
            {doctorDisplayName(doctor.name, t("doctor.namePrefix"))}
          </h2>
          <p className={styles["doctor-text"]}>{doctor.speciality}</p>
          <p className={styles["doctor-text"]}>
            {fmt(t("doctor.experience"), { exp: doctor.workExperience })}
          </p>
          <p className={styles["doctor-text"]}>
            <span className={styles["location-highlight"]}>
              {/* {doctor.location} */}
            </span>{" "}
          </p>
          <p className={styles["doctor-text"]}>
            {fmt(t("doctor.fee"), { price: doctor.price })}
          </p>
          <div className={styles["patient-stories"]}>
            <div className={styles["thumbs-up-container"]}>
              <span className={styles["percentage"]}>96%</span>
              <a href="#reviews" className={styles["patient-stories-link"]}>
                {fmt(t("doctor.patientStories"), { n: doctor.reviews })}
              </a>
            </div>

            <div className={styles["availability-info"]}>
              <span className={styles["calendar-icon"]}>📅</span>{" "}
              {t("doctor.availableToday")}
            </div>
          </div>
        </div>
        <div className={`${styles["doctor-booking-section"]} text-center`}>
          <div className="mr-auto ml-auto mt-3 mb-3">
            <ConsultationButton>{t("doctor.bookConsultation")}</ConsultationButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
