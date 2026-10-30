import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import styles from "./TimetablePage.module.css";
import { formatTime } from "../helper";
import { doctorDisplayName } from "../../utils/doctorName";
import { formatWorkDaysLabel } from "../../customUtils/workDays";
import {
  SLOT_STATUS,
  addDaysIso,
  countSlotsByStatus,
  groupSlotsIntoBlocks,
  isoShortDate,
  isoWeekday,
  istDateOf,
  istTimeOf,
  istTodayIso,
  mondayOfIso,
  weekRangeLabel,
} from "./lib/weekSchedule";

const STATUS_LABELS = {
  [SLOT_STATUS.AVAILABLE]: "Available",
  [SLOT_STATUS.BOOKED]: "Booked",
  [SLOT_STATUS.PAST]: "Time passed",
};

// "7:00–9:00 AM" instead of "07:00 AM - 09:00 AM": a band label has to fit in a
// ~105px day column, so the meridiem is printed once when both ends share it.
const compactTime = (time) => time.replace(/^0/, "");

const bandLabel = (start, end) => {
  const from = formatTime(start).split(" ");
  const to = formatTime(end).split(" ");
  if (from.length === 2 && to.length === 2 && from[1] === to[1]) {
    return `${compactTime(from[0])}–${compactTime(to[0])} ${to[1]}`;
  }
  return `${compactTime(from[0])} ${from[1] || ""}–${compactTime(to[0])} ${
    to[1] || ""
  }`.trim();
};

// Four weeks from today: enough to plan ahead without paging into a schedule
// cron-jobs.js has not generated yet.
const MAX_WEEKS_AHEAD = 3;

const sameTarget = (a, b) =>
  Boolean(a && b && a.date === b.date && a.time === b.time);

/**
 * The slot a band stands for, in the shape `/appointment` understands.
 *
 * A band is a merged run of 20-minute slots, so it starts the clock at its first
 * slot: tapping "9:00–11:00 AM" books the 9:00 AM slot, and the booking form
 * preselects exactly that one.
 */
const bandTarget = (block) => {
  const date = istDateOf(block.startTime);
  return {
    date,
    time: istTimeOf(block.startTime),
    dayLabel: `${isoWeekday(date)} ${isoShortDate(date)}`,
    rangeLabel: bandLabel(block.startTime, block.endTime),
  };
};

const TimetablePage = () => {
  const router = useRouter();
  const storeDoctorId = useSelector(
    (state) => state.allDoctorS.doctorInfo?._id || ""
  );
  const queryDoctorId =
    typeof router.query.doctorId === "string" ? router.query.doctorId : "";

  // "View Timetable" carries the id in the URL; the redux copy keeps the plain
  // /timetable link working right after a profile visit.
  //
  // `routeReady` keeps the first client render identical to the server one: the
  // query string (and the persisted redux store) only exist after hydration, so
  // reading them earlier would hydrate a different tree and warn.
  const [routeReady, setRouteReady] = useState(false);
  useEffect(() => setRouteReady(true), []);

  const doctorId = routeReady ? queryDoctorId || storeDoctorId : "";

  const thisMonday = useMemo(() => mondayOfIso(istTodayIso()), []);
  const lastMonday = addDaysIso(thisMonday, MAX_WEEKS_AHEAD * 7);

  const [weekStart, setWeekStart] = useState(thisMonday);
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(Boolean(doctorId));
  const [error, setError] = useState("");
  // Band the patient tapped; `null` means "use the next available slot".
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    if (!routeReady || !doctorId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const loadWeek = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/slots/fetchWeekSlots?doctorId=${doctorId}&start=${weekStart}`
        );
        const result = await response.json();
        if (cancelled) return;
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load the timetable.");
        }
        setWeek(result.data);
      } catch (err) {
        if (cancelled) return;
        setWeek(null);
        setError(err.message || "Unable to load the timetable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadWeek();
    return () => {
      cancelled = true;
    };
  }, [doctorId, weekStart, routeReady]);

  const days = useMemo(() => week?.days || [], [week]);
  const today = istTodayIso();
  const totals = useMemo(
    () =>
      (week?.days || []).reduce(
        (acc, day) => {
          const counts = countSlotsByStatus(day.slots);
          acc.available += counts.available;
          acc.booked += counts.booked;
          return acc;
        },
        { available: 0, booked: 0 }
      ),
    [week]
  );

  const doctor = week?.doctor;
  const hoursLabel =
    doctor?.slotStartTime && doctor?.slotEndTime
      ? `${formatTime(doctor.slotStartTime)} - ${formatTime(doctor.slotEndTime)}`
      : "";
  const hasAnySlot = days.some((day) => day.slots.length > 0);

  // What "Book an Appointment" carries when no band was tapped: the first free
  // band of a day that has stored `Slot` rows. Days `fetchWeekSlots` derives
  // from the doctor's window (`generated`) have no row to lock, so they would
  // land on an empty slot picker - skip them.
  const nextAvailable = useMemo(() => {
    for (const day of days) {
      if (day.generated) continue;
      const block = groupSlotsIntoBlocks(day.slots).find(
        (item) => item.status === SLOT_STATUS.AVAILABLE
      );
      if (block) return bandTarget(block);
    }
    return null;
  }, [days]);

  const target = picked || nextAvailable;
  const appointmentHref = target
    ? `/appointment?doctorId=${doctorId}&date=${target.date}&time=${target.time}`
    : `/appointment?doctorId=${doctorId}`;

  const goToWeek = (offsetWeeks) => {
    const next = addDaysIso(weekStart, offsetWeeks * 7);
    if (next < thisMonday || next > lastMonday) return;
    setWeekStart(next);
    // The picked band belongs to the week being left behind.
    setPicked(null);
  };

  if (!routeReady) {
    return (
      <div id="timetable-page" className="timetable-section division">
        <div className="container">
          <p className={styles["state"]}>Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div id="timetable-page" className="timetable-section division">
        <div className="container">
          <div className={styles["notice"]}>
            <h4 className={styles["notice-title"]}>Pick a doctor first</h4>
            <p className={styles["notice-text"]}>
              Open a doctor profile and use &quot;View Timetable&quot; to see that
              doctor&apos;s weekly slots.
            </p>
            <Link legacyBehavior href="/all-doctors">
              <a className={styles["cta-btn"]}>Browse doctors</a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="timetable-page" className="timetable-section division">
      <div className="container">
        {/* Doctor + week navigation */}
        <div className={styles["shell"]}>
          <div className={styles["head"]}>
            <div className={styles["identity"]}>
              <span className={styles["eyebrow"]}>Weekly timetable</span>
              <h3 className={styles["doctor-name"]}>
                {doctor?.name
                  ? doctorDisplayName(doctor.name)
                  : "Doctor timetable"}
              </h3>
              {doctor?.expertise ? (
                <p className={styles["speciality"]}>{doctor.expertise}</p>
              ) : null}
              <div className={styles["facts"]}>
                {doctor?.workDays ? (
                  <span className={styles["fact"]}>
                    <i className="fas fa-calendar-alt" aria-hidden="true" />
                    {formatWorkDaysLabel(doctor.workDays)}
                  </span>
                ) : null}
                {hoursLabel ? (
                  <span className={styles["fact"]}>
                    <i className="far fa-clock" aria-hidden="true" />
                    {hoursLabel}
                  </span>
                ) : null}
                <span className={styles["fact"]}>
                  <i className="fas fa-hourglass-half" aria-hidden="true" />
                  20 min per consultation
                </span>
              </div>
            </div>

            <div className={styles["week-nav"]}>
              <span className={styles["range"]}>
                {weekRangeLabel(weekStart)}
              </span>
              <div className={styles["nav-buttons"]}>
                <button
                  type="button"
                  className={styles["nav-btn"]}
                  onClick={() => goToWeek(-1)}
                  disabled={weekStart <= thisMonday}
                >
                  <i className="fas fa-chevron-left" aria-hidden="true" /> Prev
                </button>
                <button
                  type="button"
                  className={styles["nav-btn"]}
                  onClick={() => setWeekStart(thisMonday)}
                  disabled={weekStart === thisMonday}
                >
                  This week
                </button>
                <button
                  type="button"
                  className={styles["nav-btn"]}
                  onClick={() => goToWeek(1)}
                  disabled={weekStart >= lastMonday}
                >
                  Next <i className="fas fa-chevron-right" aria-hidden="true" />
                </button>
              </div>
              {hasAnySlot ? (
                <span className={styles["summary"]}>
                  <strong>{totals.available}</strong> free slots ·{" "}
                  <strong>{totals.booked}</strong> booked
                </span>
              ) : null}
            </div>
          </div>

          <div className={styles["legend"]}>
            <span className={styles["legend-item"]}>
              <i className={`${styles["dot"]} ${styles["dot-available"]}`} />
              Available
            </span>
            <span className={styles["legend-item"]}>
              <i className={`${styles["dot"]} ${styles["dot-booked"]}`} />
              Booked
            </span>
            <span className={styles["legend-item"]}>
              <i className={`${styles["dot"]} ${styles["dot-past"]}`} />
              Time passed
            </span>
          </div>
        </div>

        {loading ? (
          <p className={styles["state"]}>Loading this week&apos;s slots...</p>
        ) : error ? (
          <p className={`${styles["state"]} ${styles["state-error"]}`}>{error}</p>
        ) : (
          <div className={styles["week"]}>
            {days.map((day) => {
              const counts = countSlotsByStatus(day.slots);
              const blocks = groupSlotsIntoBlocks(day.slots);
              const isToday = day.date === today;

              return (
                <article
                  key={day.date}
                  className={`${styles["day"]} ${
                    isToday ? styles["day-today"] : ""
                  } ${day.isWorkDay ? "" : styles["day-off"]}`}
                >
                  <header className={styles["day-head"]}>
                    <span className={styles["day-name"]}>
                      {isoWeekday(day.date)}
                    </span>
                    <span className={styles["day-date"]}>
                      {isoShortDate(day.date)}
                    </span>
                    {isToday ? (
                      <span className={styles["today-badge"]}>Today</span>
                    ) : null}
                  </header>

                  <div className={styles["day-body"]}>
                    {!day.isWorkDay ? (
                      <p className={styles["day-note"]}>Not a working day</p>
                    ) : day.isUnavailable ? (
                      <p className={styles["day-note"]}>Doctor unavailable</p>
                    ) : blocks.length === 0 ? (
                      <p className={styles["day-note"]}>No slots published</p>
                    ) : (
                      blocks.map((block) => {
                        const selectable =
                          block.status === SLOT_STATUS.AVAILABLE &&
                          !day.generated;
                        const candidate = selectable ? bandTarget(block) : null;
                        const isTarget = sameTarget(target, candidate);
                        const blockClassName = `${styles["block"]} ${
                          styles[`block-${block.status}`]
                        }${selectable ? ` ${styles["block-pickable"]}` : ""}${
                          isTarget ? ` ${styles["block-selected"]}` : ""
                        }`;
                        const label = (
                          <>
                            <span className={styles["block-time"]}>
                              {bandLabel(block.startTime, block.endTime)}
                            </span>
                            <span className={styles["block-meta"]}>
                              {STATUS_LABELS[block.status]} · {block.count}{" "}
                              {block.count === 1 ? "slot" : "slots"}
                            </span>
                          </>
                        );
                        const blockKey = `${day.date}-${block.startTime}-${block.status}`;

                        if (!selectable) {
                          return (
                            <div key={blockKey} className={blockClassName}>
                              {label}
                            </div>
                          );
                        }

                        return (
                          <button
                            key={blockKey}
                            type="button"
                            className={blockClassName}
                            aria-pressed={isTarget}
                            title={`Pick ${candidate.dayLabel}, ${candidate.rangeLabel}`}
                            onClick={() =>
                              setPicked(
                                sameTarget(picked, candidate) ? null : candidate
                              )
                            }
                          >
                            {label}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {counts.available + counts.booked > 0 ? (
                    <footer className={styles["day-foot"]}>
                      {counts.available > 0 ? (
                        <span className={styles["free-count"]}>
                          {counts.available} free
                        </span>
                      ) : (
                        <span />
                      )}
                      {counts.booked > 0 ? (
                        <span className={styles["booked-count"]}>
                          {counts.booked} booked
                        </span>
                      ) : null}
                    </footer>
                  ) : counts.past > 0 ? (
                    <footer className={styles["day-foot"]}>
                      <span className={styles["booked-count"]}>
                        {counts.past} slots · day completed
                      </span>
                    </footer>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}

        <div className={styles["foot"]}>
          <div className={styles["foot-info"]}>
            <p className={styles["foot-picked"]}>
              {target ? (
                <>
                  <span className={styles["foot-picked-label"]}>
                    {picked ? "Selected slot" : "Next available slot"}
                  </span>
                  <strong>
                    {target.dayLabel} · {target.rangeLabel}
                  </strong>
                </>
              ) : (
                <span className={styles["foot-note"]}>
                  No bookable slot free this week - pick a date in the form.
                </span>
              )}
            </p>
            <p className={styles["foot-note"]}>
              All timings are in IST · tap an available band to pick that slot
            </p>
          </div>
          <Link legacyBehavior href={appointmentHref}>
            <a className={styles["cta-btn"]}>Book an Appointment</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;
