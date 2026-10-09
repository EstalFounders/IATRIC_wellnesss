// NextConsultation.js
// The one appointment that matters before anything else: the soonest upcoming
// consultation, with the two actions that follow from it. The card is driven
// entirely by its prop (HomepageComp passes the first entry of the upcoming
// bucket), so it can never disagree with the "Upcoming" stat card.
import React from "react";
import { useRouter } from "next/router";
import { IoMdCalendar } from "react-icons/io";
import { appointment_status, price_symbol } from "../../../constant";
import { extractTime, formatIstDate, isSameIstDay } from "../utils/helper";
import { statusLabel, statusPillClass } from "./appointmentStatus";
import styles from "../css/HomePage.module.css";

const PRESCRIPTION_ROUTE = "/registerDoc/prescription";

const NextConsultation = ({ appointment }) => {
  const router = useRouter();

  if (!appointment) {
    return (
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IoMdCalendar /> Next consultation
        </h2>
        <p className={styles.empty}>
          Nothing is booked from now on. New bookings arrive here with a link to
          the meeting room.
        </p>
      </section>
    );
  }

  const meetingId = appointment.meetingId;
  const status = String(appointment.status || "").toUpperCase();
  // A cancelled or finished consultation has no room to join; the in-app route
  // is used (rather than the absolute `doctorMeetingUrl` the API stores) so the
  // link works on localhost and preview deployments too.
  const canJoin =
    Boolean(meetingId) &&
    status !== appointment_status.cancelled &&
    status !== appointment_status.completed;
  const when = isSameIstDay(appointment.appointmentTime, new Date())
    ? "Today"
    : formatIstDate(appointment.appointmentTime);

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>
        <IoMdCalendar /> Next consultation
      </h2>

      <p className={styles.nextName}>{appointment.name || "Patient"}</p>
      <p className={styles.nextWhen}>
        {when} · {extractTime(appointment.appointmentTime)} IST
      </p>

      <div className={styles.nextMeta}>
        <span className={statusPillClass(appointment.status)}>
          {statusLabel(appointment.status)}
        </span>
        <span>{appointment.consultationType || "Consultation"}</span>
        <span>
          {price_symbol}
          {Number(appointment.consultationprice || 0).toLocaleString("en-IN")}
        </span>
        {appointment.patientMobNo ? (
          <span>{appointment.patientMobNo}</span>
        ) : null}
      </div>

      {appointment.symptoms ? (
        <p className={styles.nextSymptoms}>{appointment.symptoms}</p>
      ) : null}

      <div className={styles.actions}>
        {canJoin ? (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => router.push(`/meeting/doctor/${meetingId}`)}
          >
            Join consultation
          </button>
        ) : null}
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => router.push(PRESCRIPTION_ROUTE)}
        >
          Write prescription
        </button>
      </div>
    </section>
  );
};

export default NextConsultation;
