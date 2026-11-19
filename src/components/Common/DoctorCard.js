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
import { formatDegreeLabel } from "../../customUtils/educationTraining";
import { formatWorkExperienceLabel } from "../../customUtils/workExperience";

const DoctorCard = ({ doctor, index }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const doctorName = doctorDisplayName(doctor.name);

  // Specialty — the doctor's offered services (the speciality names used across
  // the site), joined into a short list.
  const services = Array.isArray(doctor.serviceOffered)
    ? doctor.serviceOffered
        .map((service) =>
          typeof service === "string"
            ? service.trim()
            : String(service?.name || "").trim()
        )
        .filter(Boolean)
    : [];
  const designation =
    services.join(" · ") ||
    t("doctor.specialtyNotListed", "Specialty not listed");

  const experienceLabel = formatWorkExperienceLabel(doctor.workExperience);
  const qualificationsLabel = formatDegreeLabel(doctor.educationTraining);

  const feesLabel = formatConsultationTypePrices(doctor.consultationType);
  const hasFee = Boolean(
    feesLabel && feesLabel !== "Free" && !feesLabel.includes("₹0")
  );
  const feeText = hasFee
    ? feesLabel
    : t("doctor.feeNotListed", "Fee details not listed");

  const [photoFailed, setPhotoFailed] = useState(false);

  // "More" toggle for long work-experience text (clamped to two lines by default).
  const [experienceExpanded, setExperienceExpanded] = useState(false);
  const [experienceClamped, setExperienceClamped] = useState(false);
  const experienceTextRef = useRef(null);

  useEffect(() => {
    const el = experienceTextRef.current;
    if (!el || experienceExpanded) return;
    setExperienceClamped(el.scrollHeight > el.clientHeight);
  }, [experienceLabel, experienceExpanded]);

  const toggleExperience = (event) => {
    event.stopPropagation();
    setExperienceExpanded((previous) => !previous);
  };

  const handleViewProfile = () => {
    const { doctorSignatureUrl, doctorStampUrl, ...filteredDoctor } = doctor;
    dispatch(setDoctorInfo(filteredDoctor));
    router.push(`/doctor-info`);
  };

  const handleCardKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
      return;
    }
    // Only react when the card itself is focused, not a nested control.
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    handleViewProfile();
  };

  const bookPath = `/appointment?doctorId=${doctor._id}`;

  return (
    <article
      key={index}
      className={styles["doctor-card"]}
      onClick={handleViewProfile}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`${t("doctor.viewProfile", "View Profile")}: ${doctorName}`}
    >
      <div className={styles["doctor-avatar"]}>
        <Image
          placeholder="blur"
          blurDataURL={imageBlurDataUrl}
          fill
          sizes="96px"
          src={
            photoFailed || !doctor.profilePictureUrl
              ? `https://placehold.co/640x640/edf3e6/3b5f1d?text=${encodeURIComponent(
                  doctorName.charAt(0)
                )}`
              : doctor.profilePictureUrl
          }
          alt={doctorName}
          className={styles["doctor-avatar-img"]}
          onError={() => setPhotoFailed(true)}
        />
      </div>

      <h2 className={styles["doctor-name"]}>{doctorName}</h2>
      <p className={styles["doctor-specialty"]}>{designation}</p>

      {qualificationsLabel && (
        <p className={styles["doctor-qualifications"]}>{qualificationsLabel}</p>
      )}

      {experienceLabel && (
        <>
          <p
            ref={experienceTextRef}
            className={
              experienceExpanded
                ? `${styles["doctor-experience"]} ${styles["doctor-experience--expanded"]}`
                : styles["doctor-experience"]
            }
          >
            {t("doctor.experienceLabel", "Experience")}: {experienceLabel}
          </p>
          {(experienceClamped || experienceExpanded) && (
            <button
              type="button"
              className={styles["doctor-more-btn"]}
              onClick={toggleExperience}
              aria-expanded={experienceExpanded}
            >
              {experienceExpanded
                ? t("doctor.showLess", "Show less")
                : t("doctor.showMore", "More")}
            </button>
          )}
        </>
      )}

      <p className={hasFee ? styles["doctor-fee"] : styles["doctor-fee-muted"]}>
        {feeText}
      </p>

      <div className={styles["doctor-card-footer"]}>
        <ConsultationButton
          path={bookPath}
          className={styles["book-button"]}
          onClick={(event) => {
            event.stopPropagation();
            router.push(bookPath);
          }}
        >
          {t("doctor.bookConsultation")}
        </ConsultationButton>
        <ConsultationButton
          variant="outline"
          className={styles["profile-button"]}
          onClick={(event) => {
            event.stopPropagation();
            handleViewProfile();
          }}
        >
          {t("doctor.viewProfile", "View Profile")}
        </ConsultationButton>
      </div>
    </article>
  );
};

export default DoctorCard;
