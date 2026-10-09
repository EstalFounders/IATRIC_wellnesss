// DocItemCards.js - one row of the home-page doctors table.
//
// The delete confirmation lives in RecentDoctors (a single modal for the whole
// table), so this row only reports the intent upwards. The edit pencil is now
// a real link to the doctor profile page.
import React from "react";
import Link from "next/link";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { formatWorkDaysLabel } from "../../../customUtils/workDays";
import { doctorDisplayName } from "../../../utils/doctorName";
import styles from "../css/Homepage.module.css";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
};

const ItemCards = ({ doctor, canDelete, busy, onDeleteRequest }) => {
  const workDays = formatWorkDaysLabel(doctor.workDays) || doctor.workDays;
  const contact = doctor.mobileNumber || doctor.email;

  return (
    <tr>
      <td className={styles.td}>
        <span className={styles.name}>{doctorDisplayName(doctor.name)}</span>
        {contact ? <span className={styles.contact}>{contact}</span> : null}
      </td>
      <td className={styles.td}>{doctor.expertise || "-"}</td>
      <td className={styles.td}>{doctor.doctorRegistrationNo || "-"}</td>
      <td className={styles.td}>{workDays || "-"}</td>
      <td className={`${styles.td} ${styles.nowrap}`}>
        {formatDate(doctor.joiningDate)}
      </td>
      <td className={styles.td}>
        <div className={styles.rowActions}>
          <Link
            className={styles.rowBtn}
            href={`/superAdmin/doctorProfile?id=${doctor._id}`}
          >
            <FaEdit />
            Edit
          </Link>
          {canDelete ? (
            <button
              type="button"
              className={`${styles.rowBtn} ${styles.rowBtnDanger}`}
              onClick={() => onDeleteRequest(doctor)}
              disabled={busy}
            >
              <MdDelete />
              Delete
            </button>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>You are not allowed to perform this action</Tooltip>
              }
            >
              <span className={styles.nowrap}>
                <button
                  type="button"
                  className={`${styles.rowBtn} ${styles.rowBtnDanger}`}
                  disabled
                >
                  <MdDelete />
                  Delete
                </button>
              </span>
            </OverlayTrigger>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ItemCards;
