// PendingApprovals.js - the two queues a super-admin has to clear.
// The counts come from the slices the header already fills, so opening the
// home page fires no extra requests.
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { MdUpdate } from "react-icons/md";
import styles from "../css/Homepage.module.css";

const PendingApprovals = () => {
  const { doctorUpdateRequest = [], doctorLeaveRequest = [] } = useSelector(
    (state) => state.notificationData || {}
  );

  const queues = [
    {
      label: "Doctor update requests",
      count: doctorUpdateRequest.length,
      path: "/superAdmin/viewAllDoctorUpdateRequest",
    },
    {
      label: "Doctor leave requests",
      count: doctorLeaveRequest.length,
      path: "/superAdmin/viewAllDoctorLeaveRequest",
    },
  ];

  return (
    <div className={styles.pendingList}>
      {queues.map((queue) => (
        <Link
          key={queue.path}
          href={queue.path}
          className={styles.pendingRow}
        >
          <span className={styles.pendingLabel}>
            <MdUpdate />
            {queue.label}
          </span>
          <span className={`${styles.pendingCount} ${queue.count === 0 ? styles.pendingCountZero : ""}`}>
            {queue.count}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default PendingApprovals;
