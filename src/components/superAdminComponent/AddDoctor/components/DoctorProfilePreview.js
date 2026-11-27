// components/DoctorProfilePreview.js
//
// Step 6, "Profile page" tab: a compact version of what /doctor-info shows. It
// uses the site's own formatters (fees, degrees, experience, languages,
// location, weekly hours) so the wording matches the public pages instead of
// inventing a second vocabulary.

import React from "react";
import Image from "next/image";
import styles from "../AddDoctorForm.module.css";
import { doctorDisplayName } from "../../../../utils/doctorName";
import {
  formatConsultationTypePrices,
  consultationTypeNames,
  toConsultationTypeEntries,
} from "../../../../utils/consultationFee";
import { formatEducationTrainingLabel } from "../../../../customUtils/educationTraining";
import {
  formatWorkExperienceLabel,
  parseTotalYearsOfExperience,
} from "../../../../customUtils/workExperience";
import { formatLanguagesLabel } from "../../../../customUtils/languages";
import { formatLocation } from "../../../../customUtils/indiaLocations";
import { formatWeeklyAvailability } from "../../../../customUtils/weeklyAvailability";

const DoctorProfilePreview = ({ doctor, photoUrl }) => {
  const name = doctorDisplayName(doctor.name) || "Doctor name";
  const fees = formatConsultationTypePrices(doctor.consultationType);
  const types = consultationTypeNames(doctor.consultationType).join(" · ");
  // Clinic name / location typed per consultation type in step 3 (optional).
  const clinics = toConsultationTypeEntries(doctor.consultationType)
    .filter((entry) => entry.clinicName || entry.clinicLocation)
    .map((entry) => {
      const where = [entry.clinicName, entry.clinicLocation]
        .filter(Boolean)
        .join(", ");
      return `${entry.name} - ${where}`;
    })
    .join(" · ");
  const qualifications = formatEducationTrainingLabel(doctor.educationTraining);
  const experience = formatWorkExperienceLabel(doctor.workExperience);
  const totalYears = parseTotalYearsOfExperience(doctor.totalyearofexperience);
  const languages = formatLanguagesLabel(doctor.language);
  const location = formatLocation(doctor.location);
  const hours = formatWeeklyAvailability(doctor.weeklyAvailability);

  const rows = [
    ["Qualifications", qualifications],
    ["Experience", experience],
    ["Total years", totalYears ? `${totalYears} years` : ""],
    ["Languages", languages],
    ["Location", location],
    ["Consultation", types],
    ["Clinic", clinics],
    ["Timings", hours],
  ].filter(([, value]) => Boolean(String(value ?? "").trim()));

  return (
    <div className={styles.profilePreview}>
      <div className={styles.profilePreviewHero}>
        <span className={styles.profilePreviewAvatar}>
          <Image
            src={
              photoUrl ||
              `https://placehold.co/240x240/edf3e6/3b5f1d?text=${encodeURIComponent(
                name.charAt(0)
              )}`
            }
            alt=""
            fill
            sizes="96px"
            unoptimized
            style={{ objectFit: "cover" }}
          />
        </span>
        <div>
          <p className={styles.profilePreviewName}>{name}</p>
          <p className={styles.profilePreviewExpertise}>
            {doctor.expertise || "Speciality"}
          </p>
          <p className={styles.profilePreviewFee}>{fees || "Fee not set"}</p>
        </div>
      </div>

      {rows.length > 0 ? (
        <dl className={styles.profilePreviewRows}>
          {rows.map(([label, value]) => (
            <div key={label} className={styles.profilePreviewRow}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className={styles.profilePreviewOverview}>
        <p className={styles.profilePreviewRowLabel}>Overview</p>
        <p className={styles.profilePreviewText}>
          {doctor.overview || "The overview written in step 2 appears here."}
        </p>
      </div>
    </div>
  );
};

export default DoctorProfilePreview;
