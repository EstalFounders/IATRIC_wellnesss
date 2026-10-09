// DoctorsList.js - the "Doctors" table of the super-admin "Consultation booked"
// page.
//
// One row per doctor with the number of consultations booked against them, and
// a dialog listing exactly those consultations. It is a real <table> so the
// header can never drift out of line with the rows (the old version was a row
// of Col md-2 headings above Col rows).
//
// `source` no longer exists: the table takes the doctors and every appointment
// as props, so it has no opinion about where the data came from.
import React, { useMemo, useState } from "react";
import PanelPagination from "../PanelPagination";
import SuperAdminModel from "../../model/SuperAdminModel";
import { doctorDisplayName } from "../../../../utils/doctorName";
import {
  extractTime,
  formatIstDate,
} from "../../../registerDocComponent/utils/helper";
import { appointment_status } from "../../../../constant";
import ItemCard from "./DocItemCards";
import { paymentBadge } from "../consultationFlags";
import styles from "../../css/ConsultationBooked.module.css";

const ITEMS_PER_PAGE = 7;

const PAYMENT_CLASS = {
  paid: styles.paymentPaid,
  pending: styles.paymentPending,
  failed: styles.paymentFailed,
  refund: styles.paymentRefund,
  none: styles.paymentNone,
};

const toText = (value) => (value || "").toString().trim().toLowerCase();

const DoctorsList = ({
  doctors = [],
  appointments = [],
  dateLabel = "",
  isLoading,
}) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // Group the appointments once, so a row lookup is O(1) instead of filtering
  // the whole list again for every doctor on every render.
  const bookingsByDoctor = useMemo(() => {
    const map = new Map();
    appointments.forEach((appointment) => {
      const key = String(appointment.doctorId ?? "");
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(appointment);
    });
    return map;
  }, [appointments]);

  const filtered = useMemo(() => {
    const needle = toText(query);
    if (!needle) return doctors;
    return doctors.filter((doctor) =>
      [
        doctorDisplayName(doctor.name),
        doctor.expertise,
        doctor.doctorRegistrationNo,
      ].some((field) => toText(field).includes(needle))
    );
  }, [doctors, query]);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(start, start + ITEMS_PER_PAGE);
  const selectedBookings = selected
    ? bookingsByDoctor.get(String(selected._id)) || []
    : [];

  const handleQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <div>
      <div className={styles.searchRow}>
        <label className={styles.countNote} htmlFor="consultationDoctorSearch">
          Search
        </label>
        <input
          id="consultationDoctorSearch"
          type="search"
          className={styles.searchInput}
          placeholder="Name, expertise or registration no."
          value={query}
          onChange={(event) => handleQuery(event.target.value)}
        />
        <span className={styles.countNote}>
          {filtered.length} of {doctors.length} doctor
          {doctors.length === 1 ? "" : "s"}
        </span>
      </div>

      {isLoading ? (
        <p className={styles.loading}>Loading doctors...</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>
          {doctors.length === 0
            ? "No doctors have been added yet."
            : "No doctor matches that search."}
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} scope="col">
                  Doctor
                </th>
                <th className={styles.th} scope="col">
                  Area of expertise
                </th>
                <th className={styles.th} scope="col">
                  Bookings
                </th>
                <th className={styles.th} scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((doctor) => (
                <ItemCard
                  key={doctor._id}
                  doctor={doctor}
                  bookingCount={
                    (bookingsByDoctor.get(String(doctor._id)) || []).length
                  }
                  onView={setSelected}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PanelPagination
        currentPage={page}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />

      <SuperAdminModel
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <>
            <h3 className={styles.modalTitle}>
              {doctorDisplayName(selected.name)}
            </h3>
            <p className={styles.modalSub}>
              {selected.expertise || "No area of expertise recorded"} ·{" "}
              {selectedBookings.length} booking
              {selectedBookings.length === 1 ? "" : "s"}
              {dateLabel ? ` on ${dateLabel}` : ""}
            </p>
            {selectedBookings.length === 0 ? (
              <p className={styles.empty}>
                No consultations booked with this doctor yet.
              </p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.modalTable}>
                  <thead>
                    <tr>
                      <th className={styles.th} scope="col">
                        Patient name &amp; ID
                      </th>
                      <th className={styles.th} scope="col">
                        Consultation type
                      </th>
                      <th className={styles.th} scope="col">
                        Appointment date &amp; time
                      </th>
                      <th className={styles.th} scope="col">
                        Payment status
                      </th>
                      <th className={styles.th} scope="col">
                        Consultation status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBookings.map((booking) => {
                      const payment = paymentBadge(booking);
                      return (
                        <tr key={booking._id}>
                          <td className={styles.td}>
                            <span className={styles.name}>
                              {booking.name || "Unnamed patient"}
                            </span>
                            {booking._id ? (
                              <span
                                className={styles.idLine}
                                title={`Booking ID ${booking._id}`}
                              >
                                ID {String(booking._id).slice(0, 8)}
                              </span>
                            ) : null}
                            <span className={styles.contact}>
                              {booking.patientMobNo || "No contact saved"}
                            </span>
                          </td>
                          <td className={styles.td}>
                            {booking.consultationType || "-"}
                          </td>
                          <td className={styles.td}>
                            {booking.appointmentTime ? (
                              <span className={styles.cellStack}>
                                <span className={styles.dateLine}>
                                  {formatIstDate(booking.appointmentTime)}
                                </span>
                                <span className={styles.timeLine}>
                                  {extractTime(booking.appointmentTime)}
                                </span>
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className={styles.td}>
                            <span
                              className={`${styles.badge} ${
                                PAYMENT_CLASS[payment.tone] || styles.badgeNeutral
                              }`}
                            >
                              {payment.label}
                            </span>
                          </td>
                          <td className={styles.td}>
                            {booking.status || appointment_status.pending}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </SuperAdminModel>
    </div>
  );
};

export default DoctorsList;
