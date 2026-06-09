import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
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

/**
 * MUI theme overrides for compact Autocomplete styling.
 * Applied via sx prop to keep inputs compact and consistent.
 */
const autocompleteSx = {
  "& .MuiAutocomplete-inputRoot": {
    paddingTop: "2px",
    paddingBottom: "2px",
    fontSize: "13px",
  },
  "& .MuiAutocomplete-input": {
    padding: "2px 4px !important",
    fontSize: "13px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ccc",
  },
  "& .MuiChip-root": {
    height: "22px",
    fontSize: "11px",
  },
};

const labelStyle = {
  fontWeight: 600,
  fontSize: "12px",
  marginBottom: "2px",
  display: "block",
  color: "#333",
};

const FrequencyTimeSelector = ({ onFrequencyChange, onTimesChange }) => {
  const [frequency, setFrequency] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);

  const handleFrequencyChange = (_event, newValue) => {
    // newValue is the selected frequency string or null (when cleared)
    const next = newValue ?? "";
    setFrequency(next);
    onFrequencyChange?.(next);
  };

  const handleTimesChange = (_event, newValue) => {
    // newValue is an array of selected time strings
    setSelectedTimes(newValue);
    onTimesChange?.(newValue);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* ── Frequency (searchable single-select dropdown) ── */}
      <div>
        <label style={labelStyle}>Frequency:</label>
        <Autocomplete
          size="small"
          options={FREQUENCIES}
          value={frequency || null}
          onChange={handleFrequencyChange}
          disableClearable={false}
          clearOnEscape
          fullWidth
          sx={autocompleteSx}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search or select frequency..."
              variant="outlined"
              size="small"
            />
          )}
        />
      </div>

      {/* ── Time (multi-select dropdown with chips) ── */}
      <div>
        <label style={labelStyle}>Time:</label>
        <Autocomplete
          size="small"
          multiple
          options={TIMES}
          value={selectedTimes}
          onChange={handleTimesChange}
          disableClearable={false}
          fullWidth
          sx={autocompleteSx}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                size="small"
                sx={{
                  height: "22px",
                  fontSize: "11px",
                  backgroundColor: "#e8f0fe",
                  border: "1px solid #bfcdfa",
                  color: color_schema.yellow,
                  fontWeight: 600,
                  "& .MuiChip-deleteIcon": {
                    color: color_schema.yellow,
                    fontSize: "16px",
                  },
                }}
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select time..."
              variant="outlined"
              size="small"
            />
          )}
        />
      </div>
    </div>
  );
};

export default FrequencyTimeSelector;
