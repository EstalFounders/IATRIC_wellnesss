// PendingApprovals.js - the queues a super-admin has to clear.
// The counts come from the slices the header / home page already fill, so
// opening the home page fires no extra requests.
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { MdUpdate } from "react-icons/md";
import { FaCalendarCheck } from "react-icons/fa";
import { appointment_status } from "../../../constant";
import styles from "../css/Homepage.module.css";

const PendingApprovals = ({ isLoading = false }) => {
  const { doctorUpdateRequest = [], doctorLeaveRequest = [] } = useSelector(
    (state) => state.notificationData || {}
  );
  // Same list the home page already fetched, so the pending-booking count needs
  // no request of its own. A "pending booking" is an appointment still waiting
  // for confirmation (the bucket the consultations page calls "Pending").
  const allAppointments = useSelector(
    (state) => state.superAdminHomePage?.allAppointments || []
  );

  const pendingBookings = allAppointments.filter(
    (appointment) => appointment.status === appointment_status.pending
  ).length;

  const queues = [
    {
      label: "Doctor update requests",
      count: doctorUpdateRequest.length,
      path: "/superAdmin/viewAllDoctorUpdateRequest",
      icon: <MdUpdate />,
      showLoading: false,
    },
    {
      label: "Doctor leave requests",
      count: doctorLeaveRequest.length,
      path: "/superAdmin/viewAllDoctorLeaveRequest",
      icon: <MdUpdate />,
      showLoading: false,
    },
    {
      label: "Pending bookings",
      count: pendingBookings,
      // Opens the consultations page with its "Pending" tile already selected.
      path: `/superAdmin/consultationBooked?filter=${appointment_status.pending}`,
      icon: <FaCalendarCheck />,
      // The list arrives with the home-page fetch, so it is the only count that
      // can be stale while the page loads.
      showLoading: true,
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
            {queue.icon}
            {queue.label}
          </span>
          <span className={`${styles.pendingCount} ${queue.count === 0 ? styles.pendingCountZero : ""}`}>
            {queue.showLoading && isLoading ? "-" : queue.count}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default PendingApprovals;
