import React, { useEffect, useRef, useState } from "react";
import styles from "./css/ViewDoctorListComp.module.css";
import Image from "next/image";
import { imageBlurDataUrl } from "../../constant";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setDoctorInfo } from "../../store/slices/bookingWebsite/allDoctorsPageSlice";
import { ConsultationButton } from "./commonUi";
import { useLanguage } from "../../i18n/LanguageContext";
import { doctorDisplayName } from "../../utils/doctorName";
import { formatConsultationTypePrices } from "../../utils/consultationFee";
import { formatEducationTrainingLabel } from "../../customUtils/educationTraining";

const DoctorCard = ({ doctor, index }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();

  // Education line: clamped to exactly one line so every card in the grid keeps
  // the same height; a "More"/"Show less" toggle reveals the rest only when the
  // text overflows (the button keeps its row even when hidden, so two cards side
  // by side stay aligned).
  const educationLabel = formatEducationTrainingLabel(doctor.educationTraining);
  const feesLabel = formatConsultationTypePrices(doctor.consultationType);
  const [educationExpanded, setEducationExpanded] = useState(false);
  const [educationOverflowing, setEducationOverflowing] = useState(false);
  const educationRef = useRef(null);

  // Measured on mount and re-measured on resize: with a one-line clamp a narrower
  // card can overflow where a wider one does not, so the toggle has to follow the
  // real width. Nothing is measured while expanded (the text is not clamped then).
  useEffect(() => {
    if (educationExpanded) return undefined;
    const el = educationRef.current;
    if (!el) return undefined;

    const measure = () =>
      setEducationOverflowing(el.scrollHeight > el.clientHeight + 1);

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [educationLabel, educationExpanded]);

  const handleViewProfile = (doctor) => {
    console.log("Doctor ID in handleview profile:", doctor);
    const { doctorSignatureUrl, doctorStampUrl, ...filteredDoctor } = doctor;
    dispatch(setDoctorInfo(filteredDoctor));
    router.push(`/doctor-info`);
  };
  return (
    <div key={index} className={styles["new-doctor-card"]}>
      {/* Photo + view profile */}
      <div className={styles["doctor-profile-pic-container"]}>
        <div className="d-flex justify-content-center align-items-center">
          <Image
            placeholder="blur"
            blurDataURL={imageBlurDataUrl}
            width={150}
            height={150}
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
          className={styles["view-profile-link"]}
          onClick={() => handleViewProfile(doctor)}
          style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
        >
          {t("doctor.viewProfile")}
        </div>
      </div>

      {/* Info */}
      <div className={styles["doctor-primary-info"]}>
        <h2 className={styles["new-doctor-name"]}>
          {doctorDisplayName(doctor.name)}
        </h2>
        <p
          className={`${styles["doctor-text"]} ${styles["doctor-text--single"]} ${styles["doctor-speciality"]}`}
        >
          {doctor.speciality || "\u00A0"}
        </p>
        {/* Always rendered: the slot (one line + the toggle row) is identical on
            every card, so cards with 1 degree and cards with 5 line up. */}
        <div className={styles["doctor-education"]}>
          <p
            ref={educationRef}
            className={`${styles["doctor-text"]} ${
              educationExpanded ? "" : styles["doctor-text--clamped"]
            }`}
          >
            {educationLabel || "\u00A0"}
          </p>
          <button
            type="button"
            className={`${styles["education-more-btn"]} ${
              educationOverflowing ? "" : styles["education-more-btn--hidden"]
            }`}
            onClick={() => setEducationExpanded((prev) => !prev)}
            aria-hidden={!educationOverflowing}
            tabIndex={educationOverflowing ? 0 : -1}
          >
            {educationExpanded ? "Show less" : "More"}
          </button>
        </div>
        <p
          className={`${styles["doctor-text"]} ${styles["doctor-text--single"]} ${styles["doctor-fees"]}`}
        >
          {feesLabel || "\u00A0"}
        </p>
        <div className={styles["patient-stories"]}>
          <div className={styles["availability-info"]}>
            <span className={styles["calendar-icon"]}>📅</span>{" "}
            {t("doctor.availableToday")}
          </div>
        </div>
      </div>

      {/* Footer button */}
      <div className={styles["doctor-booking-section"]}>
        <ConsultationButton path={`/appointment?doctorId=${doctor._id}`}>
          {t("doctor.bookConsultation")}
        </ConsultationButton>
      </div>
    </div>
  );
};

export default DoctorCard;
