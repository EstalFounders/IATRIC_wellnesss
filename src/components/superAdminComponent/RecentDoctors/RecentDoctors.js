// RecentDoctors.js - the Doctors block on the super-admin home page.
//
// The list is a real table with six columns, so the header can never drift out
// of line with the rows (it used to be Col md-2 headings over Col rows). It
// shows the eight most recently joined doctors, the search box filters name,
// expertise and registration number, and the delete confirmation is owned here
// so a single modal serves every row.
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { api, roles } from "../../../constant";
import { doctorDisplayName } from "../../../utils/doctorName";
import ConfirmModal from "../model/ConfirmModel";
import ItemCard from "./DocItemCards";
import styles from "../css/Homepage.module.css";

const VISIBLE_COUNT = 8;

const toSearchText = (value) =>
  (value || "").toString().trim().toLowerCase();

const RecentDoctors = ({ doctors = [], refreshDoctorList, isLoading }) => {
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState(null);
  const userDetails = useSelector((state) => state.userDetails.userDetails);

  const canDelete =
    Array.isArray(userDetails?.role) &&
    userDetails.role.includes(roles.superAdmin);

  const filteredDoctors = useMemo(() => {
    const sorted = [...doctors].sort(
      (a, b) => new Date(b.joiningDate || 0) - new Date(a.joiningDate || 0)
    );
    const needle = toSearchText(query);
    if (!needle) return sorted;
    return sorted.filter((doctor) =>
      [
        doctorDisplayName(doctor.name),
        doctor.expertise,
        doctor.doctorRegistrationNo,
      ].some((field) => toSearchText(field).includes(needle))
    );
  }, [doctors, query]);

  const visibleDoctors = filteredDoctors.slice(0, VISIBLE_COUNT);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `${api.addDoctor}?id=${pendingDelete._id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      setResult({
        ok: true,
        message: `${doctorDisplayName(pendingDelete.name)} has been deleted.`,
      });
      setPendingDelete(null);
      if (refreshDoctorList) await refreshDoctorList();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      setResult({
        ok: false,
        message: "Could not delete this doctor. Please try again.",
      });
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className={styles.searchRow}>
        <label className={styles.countNote} htmlFor="superAdminDoctorSearch">
          Search
        </label>
        <input
          id="superAdminDoctorSearch"
          type="search"
          className={styles.searchInput}
          placeholder="Name, expertise or registration no."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className={styles.countNote}>
          {visibleDoctors.length} of {filteredDoctors.length} doctors
        </span>
      </div>

      {result ? (
        <p
          className={`${styles.note} ${
            result.ok ? styles.noteOk : styles.noteErr
          }`}
          role="status"
        >
          {result.message}
        </p>
      ) : null}

      {isLoading ? (
        <p className={styles.loading}>Loading doctors...</p>
      ) : filteredDoctors.length === 0 ? (
        <p className={styles.empty}>
          {doctors.length === 0
            ? "No doctors have been added yet."
            : "No doctor matches that search."}
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption>
              The {visibleDoctors.length} most recently joined doctors
            </caption>
            <thead>
              <tr>
                <th className={styles.th} scope="col">Name</th>
                <th className={styles.th} scope="col">Area of expertise</th>
                <th className={styles.th} scope="col">Reg. no</th>
                <th className={styles.th} scope="col">Work days</th>
                <th className={styles.th} scope="col">Joined</th>
                <th className={styles.th} scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleDoctors.map((doctor) => (
                <ItemCard
                  key={doctor._id}
                  doctor={doctor}
                  canDelete={canDelete}
                  busy={deleting}
                  onDeleteRequest={setPendingDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.footerRow}>
        <Link className={styles.ghostBtn} href="/superAdmin/consultationBooked">
          View all doctors
        </Link>
      </div>

      <ConfirmModal
        show={Boolean(pendingDelete)}
        title="Delete doctor"
        message={
          pendingDelete
            ? `Delete ${doctorDisplayName(pendingDelete.name)}? This cannot be undone.`
            : ""
        }
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        busy={deleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default RecentDoctors;
