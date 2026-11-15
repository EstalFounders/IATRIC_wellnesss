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

  // Keep the displayed summary to two lines so card rows stay aligned.
  const educationLabel = formatEducationTrainingLabel(doctor.educationTraining);
  const feesLabel = formatConsultationTypePrices(doctor.consultationType);
  const [educationExpanded, setEducationExpanded] = useState(false);
  const services = Array.isArray(doctor.serviceOffered)
    ? doctor.serviceOffered
        .map((service) =>
          typeof service === "string"
            ? service.trim()
            : String(service?.name || "").trim()
        )
        .filter(Boolean)
    : [];
  const specialtyLabel =
    services.join(" · ") ||
    String(doctor.speciality || doctor.expertise || "").trim();
  const doctorName =
    doctorDisplayName(doctor.name) || t("doctor.nameFallback", "Doctor");
  const [photoFailed, setPhotoFailed] = useState(false);

  const handleViewProfile = () => {
    const { doctorSignatureUrl, doctorStampUrl, ...filteredDoctor } = doctor;
    dispatch(setDoctorInfo(filteredDoctor));
    router.push(`/doctor-info`);
  };

  return (
    <article
      key={index}
      className={`${styles["new-doctor-card"]} ${
        educationExpanded
          ? styles["new-doctor-card--education-expanded"]
          : ""
      }`}
      aria-label={doctorName}
    >
      <div className={styles["doctor-profile-pic-container"]}>
        <Image
          placeholder="blur"
          blurDataURL={imageBlurDataUrl}
          fill
          sizes="(max-width: 576px) 90vw, (max-width: 991px) 40vw, 320px"
          src={
            photoFailed || !doctor.profilePictureUrl
              ? `https://placehold.co/640x480/edf3e6/3b5f1d?text=${encodeURIComponent(
                  doctorName.charAt(0)
                )}`
              : doctor.profilePictureUrl
          }
          alt={doctorName}
          className={styles["doctor-profile-pic"]}
          onError={() => setPhotoFailed(true)}
        />
      </div>

      <div className={styles["doctor-primary-info"]}>
        <div className={styles["doctor-heading"]}>
          <h2 className={styles["new-doctor-name"]}>{doctorName}</h2>
          <DoctorCardText
            label={t("doctor.specialtyLabel", "Specialty")}
            showLabel={false}
            value={specialtyLabel || t("doctor.specialtyNotListed", "Specialty not listed")}
            valueClassName={styles["doctor-speciality"]}
            bounded
          />
        </div>

        <div className={styles["doctor-details"]}>
          <DoctorCardText
            label={t("doctor.qualifications", "Qualifications")}
            showLabel={false}
            value={educationLabel || t("doctor.notListed", "Not listed")}
            detailClassName={styles["doctor-qualification-detail"]}
            bounded
            expandable
            onExpandedChange={setEducationExpanded}
          />
          <DoctorCardText
            label={t("doctor.consultationFee", "Consultation fee")}
            value={feesLabel || t("doctor.feeNotListed", "Fee details not listed")}
            valueClassName={styles["doctor-fees"]}
            detailClassName={styles["doctor-fee-detail"]}
            bounded
          />
        </div>
      </div>

      <div className={styles["doctor-booking-section"]}>
        <ConsultationButton
          path={`/appointment?doctorId=${doctor._id}`}
          className={styles["book-button"]}
        >
          {t("doctor.bookConsultation")}
        </ConsultationButton>
        <button
          type="button"
          className={styles["profile-button"]}
          onClick={handleViewProfile}
        >
          {t("doctor.viewProfile")}
        </button>
      </div>
    </article>
  );
};

export default DoctorCard;
