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

const DoctorCardText = ({
  label,
  showLabel = true,
  value,
  valueClassName = "",
  detailClassName = "",
  bounded = false,
  expandable = false,
  onExpandedChange,
}) => {
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const element = textRef.current;
    if (!element || !expandable || expanded) return undefined;

    const measure = () =>
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expandable, expanded, value]);

  const isClamped = bounded && (!expandable || !expanded);
  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  return (
    <div
      className={`${styles["doctor-detail"]} ${
        bounded ? styles["doctor-detail--bounded"] : ""
      } ${detailClassName}`}
    >
      {showLabel && (
        <span className={styles["doctor-detail-label"]}>{label}</span>
      )}
      <p
        ref={textRef}
        title={value || undefined}
        className={`${styles["doctor-detail-value"]} ${valueClassName} ${
          isClamped ? styles["doctor-text--clamped"] : ""
        }`}
      >
        {value}
      </p>
      {expandable && overflows && (
        <button
          type="button"
          className={styles["education-more-btn"]}
          onClick={toggleExpanded}
          aria-expanded={expanded}
        >
          {expanded
            ? t("doctor.showLess", "Show less")
            : t("doctor.showMore", "More")}
        </button>
      )}
    </div>
  );
};

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

  // Full entries with the institutions ("MBBS - AIIMS · MD - CMC Vellore"), not
  // the credential-only `formatDegreeLabel` used by the one-line roster cards in
  // `HealthPathTeam` - the card clamps to two lines and keeps the full string in
  // the `title` tooltip.
  const qualificationsLabel = formatEducationTrainingLabel(doctor.educationTraining);

  const feesLabel = formatConsultationTypePrices(doctor.consultationType);
  const hasFee = Boolean(
    feesLabel && feesLabel !== "Free" && !feesLabel.includes("₹0")
  );
  const feeText = hasFee
    ? feesLabel
    : t("doctor.feeNotListed", "Fee details not listed");

  const [photoFailed, setPhotoFailed] = useState(false);

  // "More / Less" toggle for the education line (clamped to two lines by default,
  // so a long list of credentials does not push the rest of the card around).
  const [educationExpanded, setEducationExpanded] = useState(false);
  const [educationClamped, setEducationClamped] = useState(false);
  const educationRef = useRef(null);

  useEffect(() => {
    const el = educationRef.current;
    if (!el || educationExpanded) return;
    setEducationClamped(el.scrollHeight > el.clientHeight + 1);
  }, [qualificationsLabel, educationExpanded]);

  const toggleEducation = (event) => {
    // The whole card is a link: keep the toggle from opening the profile.
    event.preventDefault();
    event.stopPropagation();
    setEducationExpanded((previous) => !previous);
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
        <>
          <p
            ref={educationRef}
            className={
              educationExpanded
                ? `${styles["doctor-qualifications"]} ${styles["doctor-qualifications--expanded"]}`
                : styles["doctor-qualifications"]
            }
            title={qualificationsLabel}
          >
            {qualificationsLabel}
          </p>
          {(educationClamped || educationExpanded) && (
            <button
              type="button"
              className={styles["doctor-more-btn"]}
              onClick={toggleEducation}
              aria-expanded={educationExpanded}
            >
              {educationExpanded
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
