// DocItemCards.js - one row of the "Doctors" table on the Consultation booked
// page.
//
// The row only renders; opening the per-doctor bookings list is owned by
// DoctorsList, so a single dialog serves every row (the old row rendered its
// own AppointTable inside its own modal).
import React from "react";
import { FaEye } from "react-icons/fa";
import { doctorDisplayName } from "../../../../utils/doctorName";
import styles from "../../css/ConsultationBooked.module.css";

const ItemCards = ({ doctor, bookingCount = 0, onView }) => (
  <tr>
    <td className={styles.td}>
      <span className={styles.name}>{doctorDisplayName(doctor.name)}</span>
      {doctor.doctorRegistrationNo ? (
        <span className={styles.contact}>
          Reg. no {doctor.doctorRegistrationNo}
        </span>
      ) : null}
    </td>
    <td className={styles.td}>{doctor.expertise || "-"}</td>
    <td className={`${styles.td} ${styles.countCell}`}>{bookingCount}</td>
    <td className={styles.td}>
      <button
        type="button"
        className={styles.rowBtn}
        onClick={() => onView(doctor)}
      >
        <FaEye /> View bookings
      </button>
    </td>
  </tr>
);

export default ItemCards;
