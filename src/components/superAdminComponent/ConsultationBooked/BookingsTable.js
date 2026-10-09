// BookingsTable.js - the consultation bookings table of the super-admin panel.
//
// It replaced the bootstrap Col/Row "table" (whose header drifted out of line
// with the rows on narrow screens) with a real <table> plus PanelPagination, and
// it keeps its own search + page state so the page above only owns the data and
// the status-update request.
import React, { useEffect, useMemo, useState } from "react";
import PanelPagination from "./PanelPagination";
import BookingRow from "./BookingRow";
import { doctorDisplayName } from "../../../utils/doctorName";
import { paymentBadge } from "./consultationFlags";
import styles from "../css/ConsultationBooked.module.css";

const ITEMS_PER_PAGE = 8;

const toText = (value) => (value || "").toString().trim().toLowerCase();

// Everything a row prints, flattened into one haystack, so the search box can
// match the new doctor / department / payment columns too.
const searchText = (appointment, doctorsById) => {
  const doctor = doctorsById.get(String(appointment.doctorId));
  return [
    appointment.name,
    appointment.status,
    appointment.consultationType,
    appointment.patientMobNo,
    appointment.email,
    appointment.symptoms,
    doctor ? doctorDisplayName(doctor.name) : "",
    doctor?.expertise,
    paymentBadge(appointment).label,
  ]
    .map(toText)
    .join(" ");
};

const BookingsTable = ({
  appointments = [],
  doctorsById = new Map(),
  label = "Total",
  dateLabel = "",
  emptyMessage = "No consultations have been booked yet.",
  onUpdateStatus,
  updatingId,
  isLoading,
}) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = toText(query);
    if (!needle) return appointments;
    return appointments.filter((appointment) =>
      searchText(appointment, doctorsById).includes(needle)
    );
  }, [appointments, doctorsById, query]);

  // A status filter (or the search box) can leave the current page past the
  // end of the list, so every change starts again on page 1.
  useEffect(() => {
    setPage(1);
  }, [query, appointments]);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div>
      <div className={styles.searchRow}>
        <label className={styles.countNote} htmlFor="bookingSearch">
          Search
        </label>
        <input
          id="bookingSearch"
          type="search"
          className={styles.searchInput}
          placeholder="Patient, doctor, department, type, payment or status"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className={styles.countNote}>
          {visible.length} of {filtered.length} shown
        </span>
      </div>

      {isLoading ? (
        <p className={styles.loading}>Loading bookings...</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>
          {query ? "No booking matches that search." : emptyMessage}
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            {/* Column widths, measured against the worst-case row (longest
                status badge "RESCHEDULED" plus the "Prescription shared" tag,
                a long department/type, an unbreakable name, a long chip): the
                patient column holds a full name on one line and the last column
                two usable status selects. The sum is exactly .table's
                min-width, and because every cell uses
                `overflow-wrap: anywhere` content can never push a column past
                its width here - so this table fits its card without scrolling
                at every desktop width. */}
            <colgroup>
              <col style={{ width: "198px" }} />
              <col style={{ width: "61px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "116px" }} />
              <col style={{ width: "119px" }} />
              <col style={{ width: "114px" }} />
              <col style={{ width: "98px" }} />
              <col style={{ width: "137px" }} />
              <col style={{ width: "149px" }} />
            </colgroup>
            <caption>
              {label} consultations · {filtered.length} booking
              {filtered.length === 1 ? "" : "s"}
              {dateLabel ? ` · ${dateLabel}` : ""}
            </caption>
            <thead>
              <tr>
                <th className={styles.th} scope="col">
                  Patient name &amp; ID
                </th>
                <th className={styles.th} scope="col">
                  Type
                </th>
                <th className={styles.th} scope="col">
                  Date &amp; time
                </th>
                <th className={styles.th} scope="col">
                  Doctor
                </th>
                <th className={styles.th} scope="col">
                  Department
                </th>
                <th className={styles.th} scope="col">
                  Payment status
                </th>
                <th className={styles.th} scope="col">
                  Symptoms
                </th>
                <th className={styles.th} scope="col">
                  Status
                </th>
                <th className={styles.th} scope="col">
                  Update payment &amp; status
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((appointment) => (
                <BookingRow
                  key={appointment._id}
                  appointment={appointment}
                  doctor={doctorsById.get(String(appointment.doctorId)) || null}
                  onUpdateStatus={onUpdateStatus}
                  busy={updatingId === appointment._id}
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
    </div>
  );
};

export default BookingsTable;
