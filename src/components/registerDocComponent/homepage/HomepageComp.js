// HomepageComp.js
// The doctor-panel home page (pages/registerDoc/homepage.js).
//
// It is a cockpit, not a form. The hero confirms who is signed in, the four stat
// cards filter the appointments table underneath them, the "next consultation"
// card carries the two actions a doctor needs before a patient walks in (join
// the meeting room / open the prescription) and the practice summary repeats the
// contract facts without a second request.
//
// Sources - all read-only:
//   GET /api/bookConsultation?doctorId=…             -> appointments
//   GET /api/registerDoc/doctorEarnings?doctorId=…   -> earnings
// The doctor document itself comes from the panel session blob through
// readSessionDoctor(), the helper the profile and contract pages already use.
// That is the fix for the crash this page used to have: it parsed the blob
// inline and read `blob.user._id`, which threw (and blanked the page) whenever a
// session stored the doctor document directly or held no user object at all.
//
// Every request owns its own loading/error state, so a failing earnings call can
// never blank the appointments (or the reverse) - each section shows its own
// message and a Retry that reloads both.
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { api, price_symbol } from "../../../constant";
import { readSessionDoctor } from "../../Common/DoctorProfile/lib/doctorProfileSession";
import { groupAppointments } from "../utils/helper";
import {
  setAppointments,
  setDoctorEarning,
  setTodaysAppointments,
} from "../../../store/slices/registerDoc/appointmentSlice";
import DashboardSecondComp from "./DashboardSecond/DashboardSecondComp";
import HeroGreetingComp from "./HeroGreetingComp";
import NextConsultation from "./NextConsultation";
import QuickActions from "./QuickActions";
import StatsCard from "./Stats/StatsCard";
import styles from "../css/HomePage.module.css";

const EARNINGS_TIMEFRAME = "month";
const EARNINGS_ROUTE = "/registerDoc/doctorEarnings";
const LOGIN_ROUTE = "/registerDoc/login";
// One object reused as the idle value of both request states (always replaced,
// never mutated).
const IDLE = { status: "idle", error: "" };
const APPOINTMENTS_ERROR = "Could not load your appointments.";
const EARNINGS_ERROR = "Could not load your earnings.";

const money = (value) => {
  const amount = Number(value);
  return `${price_symbol}${(Number.isFinite(amount) ? amount : 0).toLocaleString(
    "en-IN"
  )}`;
};

export default function HomepageComp() {
  const dispatch = useDispatch();
  const router = useRouter();

  // undefined = the blob has not been read yet (also the value the server
  // renders, so hydration matches); null = read but unusable.
  const [doctor, setDoctor] = useState(undefined);
  const [view, setView] = useState("today");
  const [appointmentsState, setAppointmentsState] = useState(IDLE);
  const [earningsState, setEarningsState] = useState(IDLE);
  const [reloadKey, setReloadKey] = useState(0);

  const appointments = useSelector((state) => state.appointment.appointments);
  const doctorEarning = useSelector((state) => state.appointment.doctorEarnings);

  // The panel guard writes the session blob before this page renders, but it is
  // still read in an effect so the server and the first client render agree.
  useEffect(() => {
    setDoctor(readSessionDoctor());
  }, []);

  const doctorId = doctor?._id || doctor?.id || "";

  useEffect(() => {
    if (!doctorId) return undefined;

    let isActive = true;
    setAppointmentsState({ status: "loading", error: "" });

    const loadAppointments = async () => {
      try {
        const response = await fetch(
          `${api.bookConsultation}?doctorId=${doctorId}`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!isActive) return;
        dispatch(
          setAppointments(
            Array.isArray(data.appointments) ? data.appointments : []
          )
        );
        setAppointmentsState({ status: "ready", error: "" });
      } catch (error) {
        if (!isActive) return;
        console.error("Could not load the appointments:", error);
        setAppointmentsState({ status: "error", error: APPOINTMENTS_ERROR });
      }
    };

    loadAppointments();
    return () => {
      isActive = false;
    };
  }, [dispatch, doctorId, reloadKey]);

  useEffect(() => {
    if (!doctorId) return undefined;

    let isActive = true;
    setEarningsState({ status: "loading", error: "" });

    const loadEarnings = async () => {
      try {
        const response = await fetch(
          `${api.doctorEarning}?doctorId=${doctorId}&timeframe=${EARNINGS_TIMEFRAME}`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!isActive) return;
        dispatch(setDoctorEarning(data));
        setEarningsState({ status: "ready", error: "" });
      } catch (error) {
        if (!isActive) return;
        console.error("Could not load the earnings:", error);
        setEarningsState({ status: "error", error: EARNINGS_ERROR });
      }
    };

    loadEarnings();
    return () => {
      isActive = false;
    };
  }, [dispatch, doctorId, reloadKey]);

  const groups = useMemo(() => groupAppointments(appointments), [appointments]);

  // viewAllAppointment reads the store's "Today" list; nothing filled it once
  // the old card click went away, so keep it in step with the same filter the
  // cards and the table use.
  useEffect(() => {
    dispatch(setTodaysAppointments(groups.today));
  }, [dispatch, groups.today]);

  if (doctor === undefined) {
    return <div className={styles.state}>Loading your panel…</div>;
  }

  if (!doctor) {
    return (
      <div className={styles.state}>
        <p>
          We could not read your details from this session. Please sign in
          again.
        </p>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => router.push(LOGIN_ROUTE)}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  const appointmentsLoading = appointmentsState.status === "loading";
  const count = (value) => (appointmentsLoading ? "…" : value);
  const earningsUnavailable = earningsState.status === "error";
  const earningsLoading = earningsState.status === "loading";
  const earnings = {
    allTime: Number(doctorEarning?.totalEarningsAllTime) || 0,
    timeframe: Number(doctorEarning?.totalEarningsTimeframe) || 0,
  };

  const statCards = [
    {
      key: "today",
      label: "Today",
      value: count(groups.today.length),
      hint: "Consultations on today's IST date",
    },
    {
      key: "upcoming",
      label: "Upcoming",
      value: count(groups.upcoming.length),
      hint: "From now on, soonest first",
    },
    {
      key: "completed",
      label: "Completed",
      value: count(groups.completed.length),
      hint: "Consultations marked completed",
    },
    {
      key: "earnings",
      label: `Earnings · ${EARNINGS_TIMEFRAME}`,
      value: earningsLoading
        ? "…"
        : earningsUnavailable
        ? "—"
        : money(earnings.timeframe),
      hint: earningsUnavailable
        ? "Earnings could not be loaded"
        : `${money(earnings.allTime)} all time`,
      earning: true,
    },
  ];

  const handleSelect = (key) => {
    if (key === "earnings") {
      router.push(EARNINGS_ROUTE);
      return;
    }
    setView(key);
  };

  const retry = () => setReloadKey((key) => key + 1);

  return (
    <div className={styles.page}>
      <HeroGreetingComp doctor={doctor} />

      <StatsCard
        cards={statCards}
        activeView={view}
        onSelect={handleSelect}
        loading={earningsLoading}
        error={earningsUnavailable ? earningsState.error : ""}
        onRetry={retry}
      />

      <div className={styles.grid}>
        <NextConsultation appointment={groups.upcoming[0] || null} />
        <QuickActions />
      </div>

      <DashboardSecondComp
        doctor={doctor}
        appointments={groups[view] || groups.all}
        view={view}
        onViewChange={setView}
        state={appointmentsState}
        onRetry={retry}
      />
    </div>
  );
}

