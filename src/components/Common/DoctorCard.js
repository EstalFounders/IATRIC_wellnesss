import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import styles from "./css/ViewDoctorListComp.module.css";
import { imageBlurDataUrl } from "../../constant";
import { setDoctorInfo } from "../../store/slices/bookingWebsite/allDoctorsPageSlice";
import { ConsultationButton } from "./commonUi";
import { useLanguage } from "../../i18n/LanguageContext";
import { doctorDisplayName } from "../../utils/doctorName";
import { toConsultationTypeEntries } from "../../utils/consultationFee";
import { doctorSpecialities } from "../../utils/doctorSpeciality";
import { formatWorkDaysLabel } from "../../customUtils/workDays";
import { isDoctorAvailableOn } from "../filterbar/filterDoctors";

// How many speciality pills and fee rows fit on one card before the rest fold
// away - keeps every card in a row the same height.
const MAX_SPECIALITY_PILLS = 2;
const MAX_FEE_ROWS = 3;

// Panel-seeded consultation names are long ("Video call consultation"); the card
// prints the short form. A custom name the panel does not know is shown as stored.
const shortConsultationLabel = (name) =>
  String(name || "")
    .trim()
    .replace(/\s+consultation$/i, "");

// One glyph per consultation mode, matched on the stored name (legacy names in
// caps or short form included).
const CONSULTATION_ICONS = [
  [/home/i, "fa-house-medical"],
  [/video|online|tele/i, "fa-video"],
  [/clinic|hospital|physical|offline|visit/i, "fa-hospital"],
  [/audio|call|phone/i, "fa-phone"],
  [/chat|message/i, "fa-comments"],
];

const consultationIcon = (name) => {
  const value = String(name || "");
  const match = CONSULTATION_ICONS.find(([pattern]) => pattern.test(value));
  return match ? match[1] : "fa-stethoscope";
};

// AddDoctor wizard uses this same card as a live preview (`preview`), so what the
// admin sees on step 6 is literally the card patients get on /all-doctors -
// without navigating anywhere.
const DoctorCard = ({ doctor, preview = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const doctorName = doctorDisplayName(doctor.name);

  // Speciality - the step-2 `expertise` pills, legacy `serviceOffered` as fallback.
  const specialities = doctorSpecialities(doctor);
  const extraSpecialities = Math.max(specialities.length - MAX_SPECIALITY_PILLS, 0);

  // Consultation mode + fee, one row each. Legacy documents carry a single
  // `price` and no type list, which still gets a row.
  const feeEntries = toConsultationTypeEntries(doctor.consultationType);
  const legacyPrice = Number(doctor.price);
  const feeRows = feeEntries.length
    ? feeEntries.slice(0, MAX_FEE_ROWS).map((entry) => ({
        name: shortConsultationLabel(entry.name),
        icon: consultationIcon(entry.name),
        price: entry.price,
      }))
    : Number.isFinite(legacyPrice) && legacyPrice > 0
    ? [
        {
          name: t("doctor.consultationFee", "Consultation fee"),
          icon: "fa-stethoscope",
          price: legacyPrice,
        },
      ]
    : [];

  // Availability is computed after mount: `new Date()` on the server would hydrate
  // a different pill than the browser renders at midnight.
  const [availableToday, setAvailableToday] = useState(false);
  useEffect(() => {
    setAvailableToday(isDoctorAvailableOn(doctor, new Date()));
  }, [doctor]);

  const workDaysLabel = formatWorkDaysLabel(doctor.workDays);
  const availabilityText = availableToday
    ? t("doctor.availableToday", "Available Today")
    : workDaysLabel || t("doctor.availabilityNotListed", "Availability not listed");

  const [photoFailed, setPhotoFailed] = useState(false);

  const photoSrc =
    photoFailed || !doctor.profilePictureUrl
      ? `https://placehold.co/640x640/edf3e6/3b5f1d?text=${encodeURIComponent(
          doctorName.charAt(0)
        )}`
      : doctor.profilePictureUrl;
  // A locally picked picture is a `blob:` URL (the Add Doctor preview), which the
  // Next image optimiser cannot fetch - those are served as-is.
  const isLocalPhoto = /^(blob|data):/.test(String(photoSrc));

  // The profile page reads the doctor from redux, so the card has to hand it over
  // before navigating; the signature/stamp files never travel to the client.
  const rememberDoctor = () => {
    const { doctorSignatureUrl, doctorStampUrl, ...filteredDoctor } = doctor;
    dispatch(setDoctorInfo(filteredDoctor));
  };

  const openProfile = () => {
    if (preview) return;
    rememberDoctor();
    router.push("/doctor-info");
  };

  const handleNameLinkClick = (event) => {
    if (preview) {
      event.preventDefault();
      return;
    }
    // <Link> performs the navigation; stopping here only keeps the card's own
    // click handler from navigating a second time.
    event.stopPropagation();
    rememberDoctor();
  };

  const bookPath = `/appointment?doctorId=${doctor._id}`;

  return (
    <article
      className={styles["doctor-card"]}
      onClick={preview ? undefined : openProfile}
    >
      <div className={styles["doctor-card-media"]}>
        <span
          className={
            availableToday
              ? styles["doctor-status"]
              : `${styles["doctor-status"]} ${styles["doctor-status--muted"]}`
          }
          title={workDaysLabel || undefined}
        >
          <i
            className={`fas ${availableToday ? "fa-circle-check" : "fa-calendar-day"}`}
            aria-hidden="true"
          />
          {availabilityText}
        </span>

        <div className={styles["doctor-avatar"]}>
          <Image
            placeholder="blur"
            blurDataURL={imageBlurDataUrl}
            fill
            sizes="(max-width: 575px) 92px, 104px"
            unoptimized={isLocalPhoto}
            src={photoSrc}
            alt={doctorName}
            className={styles["doctor-avatar-img"]}
            onError={() => setPhotoFailed(true)}
          />
        </div>
      </div>

      <div className={styles["doctor-card-body"]}>
        {preview ? (
          <h2 className={styles["doctor-name"]}>{doctorName}</h2>
        ) : (
          <Link
            href="/doctor-info"
            className={styles["doctor-name-link"]}
            onClick={handleNameLinkClick}
          >
            <h2 className={styles["doctor-name"]}>{doctorName}</h2>
          </Link>
        )}

        {specialities.length ? (
          <ul className={styles["doctor-specialities"]}>
            {specialities.slice(0, MAX_SPECIALITY_PILLS).map((speciality) => (
              <li key={speciality} className={styles["doctor-speciality-chip"]}>
                {speciality}
              </li>
            ))}
            {extraSpecialities > 0 && (
              <li
                className={`${styles["doctor-speciality-chip"]} ${styles["doctor-speciality-chip--more"]}`}
                title={specialities.join(" · ")}
              >
                {t("doctor.moreSpecialities", "+{n} more", { n: extraSpecialities })}
              </li>
            )}
          </ul>
        ) : (
          <p className={styles["doctor-speciality-missing"]}>
            {t("doctor.specialtyNotListed", "Specialty not listed")}
          </p>
        )}

        {feeRows.length ? (
          <ul className={styles["doctor-fees"]}>
            {feeRows.map((row) => (
              <li key={`${row.name}-${row.price}`} className={styles["doctor-fee-row"]}>
                <span className={styles["doctor-fee-name"]}>
                  <i className={`fas ${row.icon}`} aria-hidden="true" />
                  <span>{row.name}</span>
                </span>
                <span
                  className={
                    row.price === 0
                      ? `${styles["doctor-fee-price"]} ${styles["doctor-fee-price--free"]}`
                      : styles["doctor-fee-price"]
                  }
                >
                  {row.price === null
                    ? "—"
                    : row.price === 0
                    ? t("doctor.free", "Free")
                    : `₹${row.price}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles["doctor-fees-empty"]}>
            {t("doctor.feeNotListed", "Fee details not listed")}
          </p>
        )}
      </div>

      <div className={styles["doctor-card-footer"]}>
        <ConsultationButton
          path={preview ? undefined : bookPath}
          className={styles["book-button"]}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!preview) router.push(bookPath);
          }}
        >
          {t("doctor.bookConsultation", "Book Now")}
        </ConsultationButton>

        <button
          type="button"
          className={styles["doctor-profile-link"]}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            openProfile();
          }}
        >
          {t("doctor.viewProfile", "View Profile")}
          <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

export default DoctorCard;

