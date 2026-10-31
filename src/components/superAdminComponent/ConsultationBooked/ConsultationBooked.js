// ConsultationBooked.js - the super-admin "Consultation booked" page
// (pages/superAdmin/consultationBooked.js).
//
// Two things changed for the better here:
//  * the page loads its own data. It used to read only from the redux store,
//    which is filled by the home page, so a deep link or a hard refresh showed
//    an empty page. It now runs one Promise.all and shows a single failure box
//    with a Retry button instead of silently rendering nothing.
//  * the three 400x200px "circles" that filtered the list became keyboard-
//    reachable filter tiles, and the Col/Row pseudo-tables became real tables
//    (see BookingsTable + DoctorList/DoctorsList). The store is still kept in
//    sync, so the home page tiles stay correct.
//
// Every style lives in css/ConsultationBooked.module.css.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { FaCalendarCheck, FaPlus, FaSync } from "react-icons/fa";
import { api, appointment_status } from "../../../constant";
import {
  setAllappointments,
} from "../../../store/slices/superAdmin/homepageSlice";
import { useDoctors } from "../../../customUtils/useDoctors";
import {
  formatIstDate,
  istDayKey,
} from "../../registerDocComponent/utils/helper";
import BookingsTable from "./BookingsTable";
import DoctorsList from "./DoctorList/DoctorsList";
import { isClosed } from "./consultationFlags";
import styles from "../css/ConsultationBooked.module.css";

// The statuses the list can be filtered by - the same three the old circles
// offered, plus the "closed" tile, each with its own "nothing here" copy.
// "CLOSED" is a UI-only sentinel (it is not a stored appointment status, so it
// deliberately stays out of appointment_status in src/constant.js): a booking
// is closed once its prescription has been shared with the patient.
const CLOSED_FILTER = "CLOSED";

const FILTERS = [
  {
    key: appointment_status.total,
    label: "Total",
    hint: "Every consultation",
    emptyMessage: "No consultations have been booked yet.",
  },
  {
    key: appointment_status.pending,
    label: "Pending",
    hint: "Awaiting confirmation",
    emptyMessage: "No pending consultations right now.",
  },
  {
    key: appointment_status.rescheduled,
    label: "Rescheduled",
    hint: "Moved to another slot",
    emptyMessage: "No rescheduled consultations right now.",
  },
  {
    key: CLOSED_FILTER,
    label: "Consultation closed",
    hint: "Prescription shared with patient",
    emptyMessage: "No consultation is closed yet.",
  },
];

const ConsultationBookedComp = () => {
  const dispatch = useDispatch();
  const [selectedBookingType, setSelectedBookingType] = useState(
    appointment_status.total
  );
  // The page-wide consultation-date range: both "" = every date (the default),
  // one "" = an open end. Each value is a plain YYYY-MM-DD calendar day, which
  // is exactly what istDayKey() prints, so the two compare without any timezone
  // maths (never toISOString().split("T")[0] - that is the UTC day).
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appointments, setAppointments] = useState([]);
  // The roster is shared redux state now - cache first, one request (see useDoctors).
  const { doctors, isLoading: isDoctorLoading } = useDoctors();
  const [isLoading, setIsLoading] = useState(true);
  const [failures, setFailures] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [note, setNote] = useState(null);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    const failed = [];

    const load = async (url, label) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Could not load ${label}:`, error);
        failed.push(label);
        return null;
      }
    };

    const bookingData = await load(api.bookConsultation, "consultation bookings");

    const appointmentList = Array.isArray(bookingData?.appointments)
      ? bookingData.appointments
      : [];

    // Dispatched even when empty, so no other panel page keeps a stale list.
    dispatch(setAllappointments(appointmentList));

    setAppointments(appointmentList);
    setFailures(failed);
    setIsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const activeFilter =
    FILTERS.find((filter) => filter.key === selectedBookingType) || FILTERS[0];

  // ── Page-wide consultation-date range ────────────────────────────────────
  // Every number on the page (all four tiles, the Consultations table and the
  // per-doctor counts) reads `datedAppointments`, so the range can never be
  // honoured by one section and ignored by another. The comparison is a plain
  // string compare on YYYY-MM-DD (istDayKey), which is inclusive and needs no
  // timezone maths; an empty side leaves that end open, and a reversed range
  // (from > to) is read as the two days it spans rather than as nothing. Rows
  // whose appointmentTime is missing/unparseable only appear under "All dates".
  const datedAppointments = useMemo(() => {
    if (!fromDate && !toDate) return appointments;
    const [lo, hi] =
      fromDate && toDate && fromDate > toDate
        ? [toDate, fromDate]
        : [fromDate, toDate];
    return appointments.filter((booking) => {
      const day = istDayKey(booking.appointmentTime);
      if (!day) return false;
      if (lo && day < lo) return false;
      if (hi && day > hi) return false;
      return true;
    });
  }, [appointments, fromDate, toDate]);

  const todayKey = istDayKey(Date.now());
  // The range as it is actually applied (the swap above), so the label never
  // prints a start that is later than its end.
  const [rangeFrom, rangeTo] =
    fromDate && toDate && fromDate > toDate
      ? [toDate, fromDate]
      : [fromDate, toDate];
  // One label for the table captions, the page note and the per-doctor dialog.
  // A single day (both ends equal, e.g. after "Today") is printed once rather
  // than as "05 Oct 2026 - 05 Oct 2026".
  const dateLabel = !rangeFrom
    ? rangeTo
      ? `up to ${formatIstDate(rangeTo)}`
      : ""
    : !rangeTo
      ? `from ${formatIstDate(rangeFrom)}`
      : rangeFrom === rangeTo
        ? formatIstDate(rangeFrom)
        : `${formatIstDate(rangeFrom)} - ${formatIstDate(rangeTo)}`;
  const isTodayRange = rangeFrom === todayKey && rangeTo === todayKey;

  // One doctor lookup shared by every row, so the Consultations table can print
  // the doctor + department without a request per booking.
  const doctorsById = useMemo(() => {
    const map = new Map();
    doctors.forEach((doctor) => map.set(String(doctor._id), doctor));
    return map;
  }, [doctors]);

  const counts = useMemo(() => {
    const acc = {
      [appointment_status.total]: datedAppointments.length,
      [appointment_status.pending]: 0,
      [appointment_status.rescheduled]: 0,
      [CLOSED_FILTER]: 0,
    };
    datedAppointments.forEach((booking) => {
      if (acc[booking.status] !== undefined) acc[booking.status] += 1;
      if (isClosed(booking)) acc[CLOSED_FILTER] += 1;
    });
    return acc;
  }, [datedAppointments]);

  const filteredBookings =
    selectedBookingType === CLOSED_FILTER
      ? datedAppointments.filter(isClosed)
      : selectedBookingType === appointment_status.total
        ? datedAppointments
        : datedAppointments.filter(
            (booking) => booking.status === selectedBookingType
          );

  // The table/dialog hand back whichever statuses the admin actually changed, so
  // a request can carry one field, the other, or both - the API applies them
  // atomically (a payment change on a booking with no Payment document is
  // rejected wholesale rather than half-applied).
  const handleUpdateStatus = async ({
    appointmentId,
    selectedStatus,
    selectedPaymentStatus,
  }) => {
    setUpdatingId(appointmentId);
    setNote(null);
    try {
      const payload = { appointmentId };
      if (selectedStatus) payload.selectedStatus = selectedStatus;
      if (selectedPaymentStatus)
        payload.selectedPaymentStatus = selectedPaymentStatus;

      const response = await fetch(`${api.bookConsultation}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // The route explains itself for the interesting cases ("No payment
        // record for this appointment"), so surface that message instead of a
        // generic "something went wrong".
        let message = "";
        let fromApi = false;
        try {
          const body = await response.json();
          message = body?.message || "";
          fromApi = Boolean(message);
        } catch {
          /* non-JSON body (e.g. an HTML error page) - use the fallback copy */
        }
        throw new Error(
          fromApi
            ? message
            : "Could not update this booking. Please try again.",
        );
      }

      // Reflect the change locally instead of making the admin reload the page.
      const nextList = appointments.map((booking) =>
        booking._id === appointmentId
          ? {
              ...booking,
              ...(selectedStatus ? { status: selectedStatus } : {}),
              ...(selectedPaymentStatus
                ? { paymentStatus: selectedPaymentStatus }
                : {}),
            }
          : booking,
      );
      setAppointments(nextList);
      dispatch(setAllappointments(nextList));

      const parts = [];
      if (selectedStatus) parts.push(`consultation ${selectedStatus}`);
      if (selectedPaymentStatus) parts.push(`payment ${selectedPaymentStatus}`);
      setNote({ ok: true, message: `Updated ${parts.join(" and ")}.` });
    } catch (error) {
      console.error("Error updating status:", error);
      setNote({ ok: false, message: error.message });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          <FaCalendarCheck />
        </span>
        <div className={styles.heroInfo}>
          <p className={styles.heroEyebrow}>Super Admin · Consultation</p>
          <h1 className={styles.heroTitle}>Consultation bookings</h1>
          <p className={styles.heroSubtitle}>
            Every consultation booked on the website. Pick a date range to
            narrow the whole page, filter by status, update a booking, or open a
            doctor&apos;s list.
          </p>
        </div>
        <div className={styles.heroActions}>
          <Link className={styles.primaryBtn} href="/superAdmin/addDoctor">
            <FaPlus /> Book appointment
          </Link>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={loadBookings}
            disabled={isLoading}
          >
            <FaSync /> {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {/* One date-range control for the whole page: the four tiles below, the
          Consultations table and the per-doctor counts all read it. Both ends
          are inclusive; leaving one empty leaves that side open. */}
      <section className={styles.dateBar}>
        <span className={styles.dateLabel}>Consultation date</span>
        <label
          className={styles.dateFieldLabel}
          htmlFor="consultationFromDate"
        >
          From
        </label>
        <input
          id="consultationFromDate"
          type="date"
          className={styles.dateInput}
          value={fromDate}
          max={toDate || undefined}
          onChange={(event) => setFromDate(event.target.value)}
        />
        <label className={styles.dateFieldLabel} htmlFor="consultationToDate">
          To
        </label>
        <input
          id="consultationToDate"
          type="date"
          className={styles.dateInput}
          value={toDate}
          min={fromDate || undefined}
          onChange={(event) => setToDate(event.target.value)}
        />
        <button
          type="button"
          className={`${styles.dateBtn} ${
            isTodayRange ? styles.dateBtnActive : ""
          }`}
          onClick={() => {
            setFromDate(todayKey);
            setToDate(todayKey);
          }}
        >
          Today
        </button>
        <button
          type="button"
          className={`${styles.dateBtn} ${
            !rangeFrom && !rangeTo ? styles.dateBtnActive : ""
          }`}
          onClick={() => {
            setFromDate("");
            setToDate("");
          }}
        >
          All dates
        </button>
        <span className={styles.dateNote}>
          {isLoading
            ? "Loading bookings..."
            : dateLabel
              ? `${datedAppointments.length} of ${appointments.length} booking${
                  appointments.length === 1 ? "" : "s"
                } ${dateLabel}`
              : `${appointments.length} booking${
                  appointments.length === 1 ? "" : "s"
                } on every date`}
        </span>
      </section>

      {failures.length > 0 ? (
        <div className={styles.errorBox} role="alert">
          <span>Some data could not be loaded: {failures.join(", ")}.</span>
          <button type="button" className={styles.retry} onClick={loadBookings}>
            Retry
          </button>
        </div>
      ) : null}

      {note ? (
        <p
          className={`${styles.note} ${note.ok ? styles.noteOk : styles.noteErr}`}
          role="status"
        >
          {note.message}
        </p>
      ) : null}

      <div className={styles.tileGrid}>
        {FILTERS.map((filter) => {
          const active = filter.key === selectedBookingType;
          return (
            <button
              key={filter.key}
              type="button"
              className={`${styles.tile} ${active ? styles.tileActive : ""}`}
              aria-pressed={active}
              onClick={() => setSelectedBookingType(filter.key)}
            >
              <span className={styles.tileLabel}>{filter.label}</span>
              <span
                className={`${styles.tileValue} ${
                  filter.key === appointment_status.rescheduled
                    ? styles.tileValueAlert
                    : filter.key === CLOSED_FILTER
                      ? styles.tileValueOk
                      : ""
                }`}
              >
                {isLoading ? "-" : counts[filter.key]}
              </span>
              <span className={styles.tileHint}>
                {active ? "Showing below" : filter.hint}
              </span>
            </button>
          );
        })}
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          Consultations{dateLabel ? ` · ${dateLabel}` : ""}
        </h2>
        <BookingsTable
          label={activeFilter.label}
          emptyMessage={activeFilter.emptyMessage}
          appointments={filteredBookings}
          doctorsById={doctorsById}
          dateLabel={dateLabel}
          onUpdateStatus={handleUpdateStatus}
          updatingId={updatingId}
          isLoading={isLoading}
        />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          Doctors{dateLabel ? ` · ${dateLabel}` : ""}
        </h2>
        <DoctorsList
          doctors={doctors}
          appointments={datedAppointments}
          dateLabel={dateLabel}
          isLoading={isDoctorLoading}
        />
      </section>
    </div>
  );
};

export default ConsultationBookedComp;
