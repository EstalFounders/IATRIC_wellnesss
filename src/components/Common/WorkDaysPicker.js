// WorkDaysPicker.js
// Monday -> Sunday toggle chips for the doctor forms ("Add Doctor" and the
// shared edit-doctor modal). Chips use inline styles, the convention for every
// tag/chip UI in the panels (see DoctorModalComp).
import React from "react";
import {
  WORK_DAYS,
  WORK_DAY_SHORT_LABELS,
  parseWorkDays,
} from "../../customUtils/workDays";

const chipStyle = (isSelected) => ({
  minWidth: 52,
  padding: "6px 12px",
  borderRadius: 18,
  border: "1px solid #3b5f1d",
  background: isSelected ? "#3b5f1d" : "#fff",
  color: isSelected ? "#fff" : "#3b5f1d",
  fontWeight: 600,
  fontSize: "0.85rem",
  lineHeight: 1.2,
  cursor: "pointer",
  transition: "background-color 0.2s ease, color 0.2s ease",
});

/**
 * `value` is an array of canonical day names (`["Monday", "Friday"]`); a legacy
 * string ("mon-sunday") is parsed too so an edit form can never render a blank
 * picker. `onChange` always receives a Monday -> Sunday ordered array.
 */
const WorkDaysPicker = ({ value = [], onChange, error = "" }) => {
  const selectedDays = parseWorkDays(value);

  const toggleDay = (day) => {
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day];

    // Re-order so the submitted value is always canonical.
    onChange?.(WORK_DAYS.filter((item) => nextDays.includes(item)));
  };

  return (
    <div>
      <div
        role="group"
        aria-label="Work days"
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {WORK_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day);

          return (
            <button
              key={day}
              type="button"
              aria-pressed={isSelected}
              aria-label={day}
              title={day}
              onClick={() => toggleDay(day)}
              style={chipStyle(isSelected)}
            >
              {WORK_DAY_SHORT_LABELS[day]}
            </button>
          );
        })}
      </div>

      {error ? (
        <div style={{ color: "#c62828", fontSize: "0.8rem", marginTop: 6 }}>
          {error}
        </div>
      ) : selectedDays.length === 0 ? (
        <span style={{ fontSize: "0.85rem", color: "#999", marginTop: 6 }}>
          No work days selected.
        </span>
      ) : null}
    </div>
  );
};

export default WorkDaysPicker;
