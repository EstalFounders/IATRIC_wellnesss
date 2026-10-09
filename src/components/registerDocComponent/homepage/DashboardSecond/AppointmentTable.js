// AppointmentTable.js
// The home page's appointment list.
//
// Two things were wrong with the old version: the "Todays Appointments" heading
// was hard-coded while the rows came from whichever filter ran last (and started
// empty, so the table claimed there were no appointments while four were
// fetched), and "Gender" was a column the appointment schema has never had, so
// it always printed "N/A". The heading is gone in favour of filter chips, the
// times are printed in IST (the timezone the helpers already use) and every
// column maps to a field that exists.
//
// Navigation lives here - joining the meeting room and opening the prescription
// are plain route pushes - so HomepageComp only owns data.
import React from "react";
import { useRouter } from "next/router";
import { IoMdCalendar } from "react-icons/io";
import { appointment_status, price_symbol } from "../../../../constant";
import { extractTime, formatIstDate } from "../../utils/helper";
import { statusLabel, statusPillClass } from "../appointmentStatus";
import styles from "../../css/HomePage.module.css";

const PRESCRIPTION_ROUTE = "/registerDoc/prescription";
const VIEW_ALL_ROUTE = "/registerDoc/viewAllAppointment";
const COLUMNS = 7;

// The same four buckets HomepageComp derives, in the order a doctor reads them.
const VIEWS = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

const EMPTY_MESSAGE = {
  today: "No consultation is booked for today.",
  upcoming: "Nothing is booked from now on.",
  completed: "No consultation has been marked completed yet.",
  all: "No appointment has been booked with you yet.",
};

// A home page lists the nearest bookings, not the archive; the rest is one click
// away in "View all appointments".
const MAX_ROWS = 10;

const AppointmentsTable = ({
  appointments = [],
  view = "all",
  onViewChange,
  state = { status: "ready", error: "" },
  onRetry,
}) => {
  const router = useRouter();
  const rows = Array.isArray(appointments) ? appointments : [];
  const shown = rows.slice(0, MAX_ROWS);
  // viewAllAppointment still understands only "Today" and "Total".
  const viewAllType = view === "today" ? "Today" : "Total";

  return (
    <section className={styles.card}>
      <div className={styles.tableHead}>
        <h2 className={styles.cardTitle}>
          <IoMdCalendar /> Appointments
        </h2>
        <div className={styles.chips}>
          {VIEWS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`${styles.chip} ${
                view === option.key ? styles.chipActive : ""
              }`}
              aria-pressed={view === option.key}
              onClick={() => onViewChange?.(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {state.status === "error" ? (
        <div className={styles.errorBox} role="alert">
          <span>{state.error}</span>
          {onRetry ? (
            <button type="button" className={styles.ghostBtn} onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Patient</th>
                  <th className={styles.th}>Appointment (IST)</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>Fee</th>
                  <th className={styles.th}>Symptoms</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.status === "loading" ? (
                  <tr>
                    <td className={styles.empty} colSpan={COLUMNS}>
                      Loading appointments…
                    </td>
                  </tr>
                ) : shown.length === 0 ? (
                  <tr>
                    <td className={styles.empty} colSpan={COLUMNS}>
                      {EMPTY_MESSAGE[view] || EMPTY_MESSAGE.all}
                    </td>
                  </tr>
                ) : (
                  shown.map((appointment) => {
                    const status = String(
                      appointment.status || ""
                    ).toUpperCase();
                    // A cancelled or finished consultation has no room to join.
                    const canJoin =
                      Boolean(appointment.meetingId) &&
                      status !== appointment_status.cancelled &&
                      status !== appointment_status.completed;

                    return (
                      <tr key={appointment._id || appointment.meetingId}>
                        <td className={`${styles.td} ${styles.name}`}>
                          {appointment.name || "Patient"}
                          {appointment.patientMobNo ? (
                            <span className={styles.contact}>
                              {appointment.patientMobNo}
                            </span>
                          ) : null}
                        </td>
                        <td className={`${styles.td} ${styles.nowrap}`}>
                          {formatIstDate(appointment.appointmentTime) || "—"}
                          <span className={styles.contact}>
                            {extractTime(appointment.appointmentTime)}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span
                            className={statusPillClass(appointment.status)}
                          >
                            {statusLabel(appointment.status)}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {appointment.consultationType || "—"}
                        </td>
                        <td className={`${styles.td} ${styles.nowrap}`}>
                          {price_symbol}
                          {Number(
                            appointment.consultationprice || 0
                          ).toLocaleString("en-IN")}
                        </td>
                        <td className={styles.td}>
                          {appointment.symptoms ? (
                            <details className={styles.details}>
                              <summary>Read</summary>
                              <p>{appointment.symptoms}</p>
                            </details>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className={styles.td}>
                          <div className={styles.rowActions}>
                            {canJoin ? (
                              <button
                                type="button"
                                className={`${styles.rowBtn} ${styles.rowBtnPrimary}`}
                                onClick={() =>
                                  router.push(
                                    `/meeting/doctor/${appointment.meetingId}`
                                  )
                                }
                              >
                                Join
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className={styles.rowBtn}
                              onClick={() => router.push(PRESCRIPTION_ROUTE)}
                            >
                              Prescription
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {rows.length > MAX_ROWS ? (
            <p className={styles.hint}>
              Showing the first {MAX_ROWS} of {rows.length} appointments.
            </p>
          ) : null}
        </>
      )}

      <div className={styles.footerActions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() =>
            router.push({
              pathname: VIEW_ALL_ROUTE,
              query: { type: viewAllType },
            })
          }
        >
          View all appointments
        </button>
      </div>
    </section>
  );
};

export default AppointmentsTable;
