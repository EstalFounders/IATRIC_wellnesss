import { useState } from "react";
import { color_schema } from "../../../constant";

const FREQUENCIES = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "SOS",
  "AS REQUIRED",
  "ALTERNATIVE DAYS",
  "BI WEEKLY",
  "BI MONTHLY",
];

const TIMES = ["Morning", "Afternoon", "Evening", "Night"];

const pillBase = {
  padding: "5px 14px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
  transition: "all 0.15s ease",
  lineHeight: "1.5",
  display: "inline-flex",
  alignItems: "center",
  background: "none",
  whiteSpace: "nowrap",
};

const pillInactive = {
  ...pillBase,
  border: "1.5px solid #ccc",
  color: "#444",
};

const pillActive = {
  ...pillBase,
  border: `2px solid ${color_schema.green}`,
  background: color_schema.green,
  color: "#fff",
};

const FrequencyTimeSelector = ({ onFrequencyChange, onTimesChange }) => {
  const [frequency, setFrequency] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);

  const handleFrequencyClick = (freq) => {
    const next = frequency === freq ? "" : freq;
    setFrequency(next);
    onFrequencyChange?.(next);
  };

  const handleTimeToggle = (time) => {
    const next = selectedTimes.includes(time)
      ? selectedTimes.filter((t) => t !== time)
      : [...selectedTimes, time];
    setSelectedTimes(next);
    onTimesChange?.(next);
  };

  const removeTime = (time) => {
    const next = selectedTimes.filter((t) => t !== time);
    setSelectedTimes(next);
    onTimesChange?.(next);
  };

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      {/* ── Frequency ── */}
      <div>
        <label style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", display: "block" }}>
          Frequency:
        </label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {FREQUENCIES.map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => handleFrequencyClick(freq)}
              style={frequency === freq ? pillActive : pillInactive}
            >
              {freq}
            </button>
          ))}
        </div>

        {frequency && (
          <div style={{ marginTop: "8px", fontSize: "13px", color: "#555" }}>
            Selected:{" "}
            <strong style={{ color: `${color_schema.yellow}` }}>{frequency}</strong>
          </div>
        )}
      </div>

      {/* ── Time ── */}
      <div>
        <label style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", display: "block" }}>
          Time:
        </label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {TIMES.map((time) => {
            const active = selectedTimes.includes(time);
            return (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeToggle(time)}
                style={active ? pillActive : pillInactive}
              >
                {time}
              </button>
            );
          })}
        </div>

        {selectedTimes.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
            {selectedTimes.map((time) => (
              <span
                key={time}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "3px 10px 3px 12px",
                  borderRadius: "999px",
                  background: "#e8f0fe",
                  color: `${color_schema.yellow}`,
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px solid #bfcdfa",
                }}
              >
                {time}
                <button
                  type="button"
                  onClick={() => removeTime(time)}
                  aria-label={`Remove ${time}`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: `${color_schema.yellow}`,
                    padding: "0 2px",
                    fontSize: "15px",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 700,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FrequencyTimeSelector;
