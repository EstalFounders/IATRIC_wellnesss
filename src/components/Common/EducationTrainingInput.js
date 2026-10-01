// EducationTrainingInput.js
// Repeatable "MBBS - Johns Hopkins University" rows with an "Add More" button
// for the doctor forms ("Add Doctor" and the shared edit-doctor modal). Rows use
// inline styles, the convention for every panel/tag UI (see WorkDaysPicker).
import React from "react";
import { MdDelete } from "react-icons/md";

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
};

const inputStyle = {
  flex: 1,
  minWidth: 0,
  width: "100%",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: 5,
  fontSize: "0.95rem",
};

const removeButtonStyle = (disabled) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  padding: "6px 8px",
  border: "1px solid #ccc",
  borderRadius: 5,
  background: disabled ? "#f5f5f5" : "#fff",
  color: disabled ? "#bbb" : "#c62828",
  cursor: disabled ? "not-allowed" : "pointer",
  lineHeight: 0,
});

const addButtonStyle = {
  marginTop: 4,
  padding: "8px 14px",
  border: "1px solid #3b5f1d",
  borderRadius: 5,
  background: "#fff",
  color: "#3b5f1d",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
};

const hintStyle = {
  margin: "6px 0 0",
  fontSize: "0.8rem",
  color: "#777",
};

/**
 * `value` is an array of draft rows (blank rows are allowed here and are dropped
 * by `parseEducationTraining` on submit). `onChange` receives the whole array.
 * At least one row is always rendered, so a single remaining row cannot be
 * removed — there would be no input left to type in.
 */
const EducationTrainingInput = ({
  value = [],
  onChange,
  placeholder = "e.g. MBBS - Johns Hopkins University",
}) => {
  const rows =
    Array.isArray(value) && value.length > 0 ? value : [""]; // keep one row open

  const canRemove = rows.length > 1;

  const handleRowChange = (index, text) => {
    onChange?.(rows.map((row, position) => (position === index ? text : row)));
  };

  const handleRemoveRow = (index) => {
    if (!canRemove) return;
    onChange?.(rows.filter((_, position) => position !== index));
  };

  const handleAddRow = () => {
    onChange?.([...rows, ""]);
  };

  return (
    <div>
      {rows.map((row, index) => (
        <div key={index} style={rowStyle}>
          <input
            type="text"
            value={row}
            placeholder={placeholder}
            aria-label={`Education or training ${index + 1}`}
            onChange={(event) => handleRowChange(index, event.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => handleRemoveRow(index)}
            disabled={!canRemove}
            aria-label={`Remove education or training ${index + 1}`}
            title={
              canRemove ? "Remove" : "Keep at least one entry to type into"
            }
            style={removeButtonStyle(!canRemove)}
          >
            <MdDelete size={18} />
          </button>
        </div>
      ))}

      <button type="button" onClick={handleAddRow} style={addButtonStyle}>
        + Add Education / Training
      </button>

      <p style={hintStyle}>Blank entries are not saved.</p>
    </div>
  );
};

export default EducationTrainingInput;
