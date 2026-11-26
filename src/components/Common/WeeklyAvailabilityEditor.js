import React from "react";
import { WORK_DAYS, WORK_DAY_SHORT_LABELS } from "../../customUtils/workDays";
import { DEFAULT_RANGE } from "../../customUtils/weeklyAvailability";
import styles from "./WeeklyAvailabilityEditor.module.css";

const WeeklyAvailabilityEditor = ({ value = [], onChange, error = "" }) => {
  const update = (next) => onChange(WORK_DAYS.filter((day) => next.some((entry) => entry.day === day)).map((day) => next.find((entry) => entry.day === day)));
  const toggle = (day) => {
    const existing = value.find((entry) => entry.day === day);
    update(existing ? value.filter((entry) => entry.day !== day) : [...value, { day, ranges: [{ ...DEFAULT_RANGE }] }]);
  };
  const changeRange = (day, index, key, time) => update(value.map((entry) => entry.day === day ? { ...entry, ranges: entry.ranges.map((range, rangeIndex) => rangeIndex === index ? { ...range, [key]: time } : range) } : entry));
  const addRange = (day) => update(value.map((entry) => entry.day === day ? { ...entry, ranges: [...entry.ranges, { ...DEFAULT_RANGE }] } : entry));
  const removeRange = (day, index) => update(value.map((entry) => entry.day === day && entry.ranges.length > 1 ? { ...entry, ranges: entry.ranges.filter((_, rangeIndex) => rangeIndex !== index) } : entry));

  return (
    <div className={styles.editor}>
      <div className={styles.dayGroup} role="group" aria-label="Work days">
        {WORK_DAYS.map((day) => {
          const selected = value.some((entry) => entry.day === day);
          return <button key={day} type="button" className={`${styles.dayButton} ${selected ? styles.dayButtonSelected : ""}`} aria-label={day} aria-pressed={selected} onClick={() => toggle(day)}>{WORK_DAY_SHORT_LABELS[day]}</button>;
        })}
      </div>
      {value.length > 0 ? <div className={styles.dayGrid}>
        {value.map(({ day, ranges }) => <fieldset key={day} className={styles.dayPanel}>
          <legend className={styles.dayLegend}>{day}</legend>
          {ranges.map((range, index) => <div key={`${day}-${index}`} className={styles.rangeRow}>
            <label className={styles.timeField}>Start time<input className={styles.timeInput} aria-label={`${day} range ${index + 1} start`} type="time" min="07:00" max="22:00" value={range.startTime} onChange={(event) => changeRange(day, index, "startTime", event.target.value)} /></label>
            <label className={styles.timeField}>End time<input className={styles.timeInput} aria-label={`${day} range ${index + 1} end`} type="time" min="07:00" max="22:00" value={range.endTime} onChange={(event) => changeRange(day, index, "endTime", event.target.value)} /></label>
            <button className={styles.removeButton} type="button" aria-label={`Remove ${day} range ${index + 1}`} disabled={ranges.length === 1} onClick={() => removeRange(day, index)}>Remove range</button>
          </div>)}
          <button className={styles.secondaryButton} type="button" onClick={() => addRange(day)}>Add range</button>
        </fieldset>)}
      </div> : null}
      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      {!value.length && !error ? <span className={styles.empty}>No work days selected.</span> : null}
    </div>
  );
};

export default WeeklyAvailabilityEditor;
