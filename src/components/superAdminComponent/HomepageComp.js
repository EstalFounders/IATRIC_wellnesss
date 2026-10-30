// HomepageComp.js - the super-admin home page.
//
// Every style lives in css/Homepage.module.css and the four visual blocks live
// in ./Homepage. The data load is one Promise.all with a single failure box and
// Retry button, instead of four silent console.error calls.
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { getMessagingIfSupported } from "../../../lib/firebase";
import { onMessage } from "firebase/messaging";
import { api } from "../../constant";
import { useDoctors } from "../../customUtils/useDoctors";
import {
  setAllappointments,
  setAllLab,
  setAllLabTest,
  setServiceOffered,
} from "../../store/slices/superAdmin/homepageSlice";
import { setConsultationType } from "../../store/slices/superAdmin/otherDetailsSlice";
import { calculateTotalIncome } from "./utility/helper";
import HeroBand from "./Homepage/HeroBand";
import StatTiles from "./Homepage/StatTiles";
import QuickActions from "./Homepage/QuickActions";
import PendingApprovals from "./Homepage/PendingApprovals";
import RecentDoctors from "./RecentDoctors/RecentDoctors";
import styles from "./css/Homepage.module.css";

export default function HomepageComp() {
  const dispatch = useDispatch();
  const [appointments, setAppointments] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const { doctors, isLoading: isDoctorLoading, refetch: refreshDoctorList } =
    useDoctors();
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [failures, setFailures] = useState([]);
  const [foregroundNote, setForegroundNote] = useState("");
  const [importing, setImporting] = useState(true);
  const [importResult, setImportResult] = useState(null);

  const loadDashboard = useCallback(async () => {
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
    const [fee, appointmentData, labTestData, labData, serviceData] =
      await Promise.all([
        load(api.consiltationFee, "consultation fees"),
        load(api.bookConsultation, "consultation bookings"),
        load(api.bookLabTest, "lab test bookings"),
        load(api.addNewLab, "labs"),
        load(api.serviceOffered, "services offered"),
      ]);

    // The lists other pages read from the store are always dispatched, even
    // when empty, so no consumer is left showing stale data.
    const appointmentList = Array.isArray(appointmentData?.appointments)
      ? appointmentData.appointments
      : [];
    const labTestList = Array.isArray(labTestData?.labTests)
      ? labTestData.labTests
      : [];

    dispatch(setAllappointments(appointmentList));
    dispatch(setAllLabTest(labTestList));
    if (fee) dispatch(setConsultationType(fee));
    if (labData) dispatch(setAllLab(labData));
    if (serviceData) dispatch(setServiceOffered(serviceData));

    setAppointments(appointmentList);
    setLabTests(labTestList);
    setTotalIncome(
      calculateTotalIncome(appointmentList, labTestList).totatIncome,
    );
    setFailures(failed);
    setIsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    let unsubscribe;
    let cancelled = false;

    // Foreground messages - skipped entirely when web push is unsupported.
    (async () => {
      const messaging = await getMessagingIfSupported();
      if (!messaging || cancelled) return;

      unsubscribe = onMessage(messaging, (payload) => {
        const notification = payload?.notification || {};
        const data = payload?.data || {};
        setForegroundNote(
          notification.title || data.title || "New notification",
        );
      });
    })();

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const handleImportFromSheet = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const response = await fetch("/api/superAdmin/importDoctorsFromSheet", {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data?.error || `${response.status} ${response.statusText}`,
        );
      }
      setImportResult({
        ok: true,
        message: `Imported ${data.imported ?? 0} doctor(s) from the sheet${
          data.skipped ? `, ${data.skipped} skipped` : ""
        }.`,
        errors: Array.isArray(data.errors) ? data.errors : [],
      });
      await loadDoctors();
    } catch (error) {
      console.error("Import from sheet failed:", error);
      setImportResult({
        ok: false,
        message: `Import failed: ${error.message || "unknown error"}`,
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.page}>
      <HeroBand />

      {failures.length > 0 ? (
        <div className={styles.errorBox} role="alert">
          <span>Some data could not be loaded: {failures.join(", ")}.</span>
          <button
            type="button"
            className={styles.retry}
            onClick={loadDashboard}
          >
            Retry
          </button>
        </div>
      ) : null}

      {foregroundNote ? (
        <p className={`${styles.note} ${styles.noteOk}`} role="status">
          {foregroundNote}
          <button
            type="button"
            className={styles.retry}
            onClick={() => setForegroundNote("")}
          >
            Dismiss
          </button>
        </p>
      ) : null}

      <StatTiles
        appointmentCount={appointments.length}
        labTestCount={labTests.length}
        doctorCount={doctors.length}
        totalIncome={totalIncome}
        isLoading={isLoading}
      />

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Pending approvals</h2>
        <PendingApprovals />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Quick actions</h2>
        <QuickActions />
      </section>

      <section id="superAdminDoctors" className={styles.section}>
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h2 className={styles.cardTitle}>Doctors</h2>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={handleImportFromSheet}
                disabled
                title="Sheet import is temporarily disabled"
                style={{ font: "inherit", opacity: 0.45, cursor: "not-allowed" }}
              >
                Import from sheet (disabled)
              </button>
              <Link className={styles.ghostBtn} href="/superAdmin/addDoctor">
                Add doctor
              </Link>
            </div>
          </div>
          {importResult ? (
            <div
              className={`${styles.note} ${
                importResult.ok ? styles.noteOk : styles.noteErr
              }`}
              role="status"
            >
              <span>{importResult.message}</span>
              {importResult.errors?.length ? (
                <ul className={styles.importErrors}>
                  {importResult.errors.map((err, index) => (
                    <li key={index}>
                      <strong>{err.name}</strong> — {err.error}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          <RecentDoctors
            doctors={doctors}
            isLoading={isDoctorLoading}
            refreshDoctorList={refreshDoctorList}
          />
        </div>
      </section>
    </div>
  );
}
