// IndiaLocationPicker.js
// Cascading, India-only "State / Region -> City" picker for the doctor forms.
// State selects the region; the City dropdown is repopulated from that state's
// cities and stays disabled until a state is chosen. It emits a structured
// { state, city } object (e.g. { state: "Maharashtra", city: "Mumbai" }), which
// the Add Doctor form stores under the doctor's `location` field.
//
// `selectClassName` lets the Add Doctor form pass its CSS-module `.select`
// class; when omitted the component falls back to matching inline styles.
// `key` should be bumped by the parent on reset so the internal selection state
// is remounted (the same pattern the form uses for its <ImageUploader />s).
import React, { useMemo, useState } from "react";
import { INDIA_STATES, parseLocation } from "../../customUtils/indiaLocations.js";

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: "0.88rem",
  fontWeight: 600,
  color: "#3f4c5a",
};

const hintStyle = {
  display: "block",
  margin: "6px 0 0",
  fontSize: "0.8rem",
  color: "#7b8794",
};

const selectStyle = {
  display: "block",
  width: "100%",
  padding: "9px 11px",
  border: "1px solid #cfd6dd",
  borderRadius: 8,
  fontSize: "0.95rem",
  color: "#1f2933",
  background: "#fff",
  marginBottom: 12,
};

const disabledStyle = {
  background: "#f3f5f7",
  color: "#7b8794",
};

/**
 * `value` may be the new `{ state, city }` object or a legacy string; it is
 * normalised by `parseLocation` (see indiaLocations.js).
 */
const IndiaLocationPicker = ({ value = "", onChange, selectClassName }) => {
  const initial = parseLocation(value);
  const [selectedState, setSelectedState] = useState(initial.state);
  const [selectedCity, setSelectedCity] = useState(initial.city);

  const cities = useMemo(() => {
    const match = INDIA_STATES.find((item) => item.state === selectedState);
    return match ? match.cities : [];
  }, [selectedState]);

  const handleStateChange = (event) => {
    const nextState = event.target.value;
    setSelectedState(nextState);
    setSelectedCity("");
    onChange?.({ state: nextState, city: "" });
  };

  const handleCityChange = (event) => {
    const nextCity = event.target.value;
    setSelectedCity(nextCity);
    onChange?.({ state: selectedState, city: nextCity });
  };

  return (
    <div>
      <span style={labelStyle}>State / Region</span>
      <select
        value={selectedState}
        onChange={handleStateChange}
        className={selectClassName}
        style={selectClassName ? undefined : selectStyle}
        aria-label="State / Region"
      >
        <option value="" disabled>
          Select state
        </option>
        {INDIA_STATES.map((item) => (
          <option key={item.state} value={item.state}>
            {item.state}
          </option>
        ))}
      </select>

      <span style={labelStyle}>City</span>
      <select
        value={selectedCity}
        onChange={handleCityChange}
        className={selectClassName}
        style={
          selectClassName
            ? undefined
            : { ...selectStyle, ...(selectedState ? {} : disabledStyle) }
        }
        disabled={!selectedState}
        aria-label="City"
      >
        <option value="" disabled>
          {selectedState ? "Select city" : "Select state first"}
        </option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <span style={hintStyle}>
        Used for off-line and home-visit consultations.
      </span>
    </div>
  );
};

export default IndiaLocationPicker;
