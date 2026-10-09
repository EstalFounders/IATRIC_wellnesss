// HeroGreetingComp.js
// The identity band at the top of the doctor home page: avatar, name, degrees
// and the practice facts a doctor expects to see confirmed ("yes, that is me").
// It also names the profile gaps that stop a prescription from printing
// (registration number, signature, stamp) and links to the profile page, which
// is the only place they can be fixed.
import React from "react";
import Link from "next/link";
import { formatEducationTrainingLabel } from "../../../customUtils/educationTraining";
import { formatWorkDaysLabel } from "../../../customUtils/workDays";
import { doctorDisplayName } from "../../../utils/doctorName";
import styles from "../css/HomePage.module.css";

const PROFILE_ROUTE = "/registerDoc/profile";

const formatDay = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/** "a, b and c" */
const listSentence = (items) => {
  if (items.length <= 1) return items[0] || "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

const HeroGreetingComp = ({ doctor }) => {
  const degrees = formatEducationTrainingLabel(doctor.educationTraining);
  const regNo = String(doctor.doctorRegistrationNo || "").trim();
  const workingDays = formatWorkDaysLabel(doctor.workDays);
  const memberSince = formatDay(doctor.joiningDate);
  const initial = (doctor.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  // The three fields the prescription prints and the profile form owns.
  const missing = [];
  if (!regNo) missing.push("registration number");
  if (!doctor.doctorSignatureUrl) missing.push("signature");
  if (!doctor.doctorStampUrl) missing.push("stamp");

  return (
    <section className={styles.hero}>
      {doctor.profilePictureUrl ? (
        <img
          src={doctor.profilePictureUrl}
          alt="Doctor profile"
          className={styles.avatar}
        />
      ) : (
        <div className={styles.avatarFallback} aria-hidden="true">
          {initial || "DR"}
        </div>
      )}

      <div className={styles.heroInfo}>
        <p className={styles.heroEyebrow}>Welcome back</p>
        <h1 className={styles.heroName}>{doctorDisplayName(doctor.name) || "Unnamed doctor"}</h1>
        <p className={styles.heroDegrees}>
          {degrees || "No degrees on file yet"}
        </p>
        <p className={styles.heroSpeciality}>
          {doctor.expertise ||
            doctor.serviceOffered ||
            "No speciality on file yet"}
        </p>
        <div className={styles.heroMeta}>
          <span className={styles.metaItem}>
            <strong>Reg. No:</strong> {regNo || "Not provided"}
          </span>
          {memberSince ? (
            <span className={styles.metaItem}>
              <strong>Member since:</strong> {memberSince}
            </span>
          ) : null}
          <span className={styles.metaItem}>
            <strong>Working days:</strong> {workingDays || "Not set"}
          </span>
        </div>
      </div>

      {missing.length > 0 ? (
        <p className={styles.banner}>
          Your profile is missing your {listSentence(missing)}, so a prescription
          cannot print {missing.length > 1 ? "them" : "it"} yet.
          <Link href={PROFILE_ROUTE} className={styles.bannerLink}>
            Complete your profile
          </Link>
        </p>
      ) : null}
    </section>
  );
};

export default HeroGreetingComp;
