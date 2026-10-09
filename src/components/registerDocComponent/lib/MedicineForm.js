import { useState, useRef, useCallback, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { api } from "../../../constant";
import FrequencyTimeSelector from "./FrequencyTimeSelector";

/* ── Shared compact input/select styles ── */
const inputStyle = {
  padding: "6px 8px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  width: "100%",
  fontSize: "13px",
};

const labelStyle = {
  fontWeight: 600,
  fontSize: "12px",
  marginBottom: "2px",
  display: "block",
  color: "#333",
};

// Server side cap for the autocomplete payload. Without it a one-letter search
// matched the whole catalogue (~6 MB) and the aborted request surfaced here as
// "Failed to fetch medicines".
const MEDICINE_LOOKUP_LIMIT = 50;

const MedicineForm = ({ onChange }) => {
  const [medicineName, setMedicineName] = useState("");
  const [medicineGeneric, setMedicineGeneric] = useState("");
  const [unit, setUnit] = useState("");
  const [dosage, setDosage] = useState("");
  const daysRef = useRef("");
  const [frequency, setFrequency] = useState("");
  const [noOfTimes, setNoOfTimes] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [medicationSchedule, setMedicationSchedule] = useState("As Required");
  const [loading, setLoading] = useState(false);
  const [medicinesInfo, setMedicinesInfo] = useState([]);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMedicineIncluded, setMedicineIncluded] = useState("");
  const debounceRef = useRef(null);
  const searchAbortRef = useRef(null);
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (searchAbortRef.current) searchAbortRef.current.abort();
    };
  }, []);

  // Autocomplete lookup. Each keystroke aborts the request still in flight and
  // stale responses are discarded, so a slow earlier lookup (or an abort) can
  // never overwrite the newest results nor be reported as a failed fetch.
  const handleMedicineSearch = useCallback(async (searchTerm) => {
    const term = searchTerm.trim();

    if (searchAbortRef.current) searchAbortRef.current.abort();
    searchRequestIdRef.current += 1;
    const requestId = searchRequestIdRef.current;

    if (!term) {
      setMedicinesInfo([]);
      setShowDropdown(false);
      setError(null);
      setLoading(false);
      return;
    }

    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    searchAbortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${api.medicineInfoApiCall}${encodeURIComponent(term)}&limit=${MEDICINE_LOOKUP_LIMIT}`,
        controller ? { signal: controller.signal } : undefined,
      );
      if (!response.ok) {
        throw new Error(`Medicine lookup failed (${response.status})`);
      }
      const data = await response.json();
      if (searchRequestIdRef.current !== requestId) return;
      setMedicinesInfo(data?.medicines || []);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } catch (err) {
      if (
        err.name === "AbortError" ||
        searchRequestIdRef.current !== requestId
      ) {
        return;
      }
      console.error("Error fetching medicine:", err);
      setError("Failed to fetch medicines. Check your connection and retry.");
      setMedicinesInfo([]);
      setShowDropdown(false);
    } finally {
      if (searchRequestIdRef.current === requestId) setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let changed = {};

    switch (name) {
      case "medicineName":
        setMedicineName(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(
          () => handleMedicineSearch(value),
          300,
        );
        changed = { medicineName: value };
        break;
      case "unit":
        setUnit(value);
        changed = { unit: value };
        break;
      case "dosage":
        setDosage(value);
        changed = { dosage: value };
        break;
      case "days":
        daysRef.current = value;
        changed = { days: value };
        break;
      case "medicationSchedule":
        setMedicationSchedule(value);
        changed = { medicationSchedule: value };
        break;
      case "noOfTimes":
        setNoOfTimes(value);
        changed = { noOfTimes: value };
        break;
      default:
        break;
    }

    // Emit the just-typed value explicitly - React state only updates on the
    // next render, so reading it back here would report the previous keystroke.
    onChange({
      medicineName,
      medicineGeneric,
      unit,
      dosage,
      days: daysRef.current,
      frequency,
      noOfTimes,
      time: selectedTimes.join(", "),
      medicationSchedule,
      ...changed,
    });
  };

  const handleMedicineSelect = (medicine) => {
    setMedicineName(medicine.name);
    setMedicineGeneric(medicine.salt);
    setShowDropdown(false);
    setMedicinesInfo([]);

    // Pass the picked medicine explicitly, the state setters above only apply
    // on the next render.
    emitEvent({ medicineName: medicine.name, medicineGeneric: medicine.salt });
  };

  const emitEvent = (overrides = {}) => {
    onChange({
      medicineName,
      medicineGeneric,
      unit,
      dosage,
      days: daysRef.current,
      frequency,
      noOfTimes,
      time: selectedTimes.join(", "),
      medicationSchedule,
      isMedicineIncluded,
      ...overrides,
    });
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || medicinesInfo.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < medicinesInfo.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : medicinesInfo.length - 1,
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleMedicineSelect(medicinesInfo[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "grid", gap: "6px" }}>
        {/* ── Row 1: Medicine name (primary) + Unit ── */}
        <Row>
          <Col xs={12} md={4} className="order-md-2">
            <label style={labelStyle}>
              UNIT:
              <select
                name="unit"
                style={inputStyle}
                onChange={handleInputChange}
                value={unit}
              >
                <option value="select">Select unit</option>
                <option value="UNIT">UNIT</option>
                <option value="TABLET">TABLET</option>
                <option value="CAPSULE">CAPSULE</option>
                <option value="TEA SPOON">TEA SPOON</option>
                <option value="DROP">DROP</option>
                <option value="APPLICATION">APPLICATION</option>
                <option value="PUFF">PUFF</option>
                <option value="PACKET">PACKET</option>
                <option value="SACHET">SACHET</option>
              </select>
            </label>
          </Col>
          <Col xs={12} md={8} className="order-md-1">
            <label style={labelStyle}>
              MEDICINE NAME:
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="medicineName"
                  value={medicineName}
                  style={inputStyle}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search or type a medicine"
                  autoComplete="off"
                />
                {loading && (
                  <small
                    style={{ position: "absolute", right: "8px", top: "8px" }}
                  >
                    Searching…
                  </small>
                )}
                {showDropdown && medicinesInfo.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      maxHeight: "180px",
                      overflowY: "auto",
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      zIndex: 10,
                    }}
                  >
                    {medicinesInfo.slice(0, 50).map((medicine, index) => (
                      <div
                        key={medicine._id}
                        style={{
                          padding: "6px 8px",
                          cursor: "pointer",
                          backgroundColor:
                            index === selectedIndex ? "#e0e0e0" : "white",
                        }}
                        onClick={() => handleMedicineSelect(medicine)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <strong>{medicine.name}</strong>
                        <br />
                        <small>{medicine.salt}</small>
                      </div>
                    ))}
                  </div>
                )}
                {showDropdown &&
                  medicinesInfo.length === 0 &&
                  !loading &&
                  medicineName && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        padding: "6px 8px",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        zIndex: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontStyle: "italic", color: "#777", fontSize: "13px" }}>
                        No medicines found
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setShowDropdown(false);
                          setMedicinesInfo([]);
                          // Manual medicine: keep the typed name with the rest of
                          // the fields. (The previous handler referenced an
                          // undefined `time` variable and threw on click.)
                          emitEvent({
                            medicineName,
                            medicineGeneric: "",
                            time: selectedTimes.join(", "),
                          });
                        }}
                      >
                        Add &quot;{medicineName}&quot; anyway
                      </button>
                    </div>
                  )}
              </div>
            </label>
            {medicineGeneric && (
              <small style={{ display: "block", color: "#555", marginTop: "2px", fontSize: "11px" }}>
                Generic: <em>{medicineGeneric}</em>
              </small>
            )}
            {error && <div className="text-danger small" style={{ fontSize: "11px" }}>{error}</div>}
          </Col>
        </Row>

        {/* ── Row 2: Dosage + Days (combined on one row) ── */}
        <Row>
          <Col xs={12} md={6}>
            <label style={labelStyle}>
              Dosage:
              <input
                type="text"
                name="dosage"
                style={inputStyle}
                placeholder="e.g. 500 mg"
                onChange={handleInputChange}
              />
            </label>
          </Col>
          <Col xs={12} md={6}>
            <label style={labelStyle}>
              Days:
              <input
                type="text"
                name="days"
                style={inputStyle}
                placeholder="e.g. 5"
                onChange={handleInputChange}
              />
            </label>
          </Col>
        </Row>

        {/* ── Row 3: FrequencyTimeSelector + No of times ── */}
        <Row>
          <Col xs={12} md={8}>
            <FrequencyTimeSelector
              onFrequencyChange={(freq) => {
                setFrequency(freq);
                onChange({
                  medicineName,
                  medicineGeneric,
                  unit,
                  dosage,
                  days: daysRef.current,
                  frequency: freq,
                  noOfTimes,
                  time: selectedTimes.join(", "),
                  medicationSchedule,
                });
              }}
              onTimesChange={(times) => {
                setSelectedTimes(times);
                onChange({
                  medicineName,
                  medicineGeneric,
                  unit,
                  dosage,
                  days: daysRef.current,
                  frequency,
                  noOfTimes,
                  time: times.join(", "),
                  medicationSchedule,
                });
              }}
            />
          </Col>
          <Col xs={12} md={4}>
            <label style={labelStyle}>
              No of times:
              <input
                name="noOfTimes"
                style={inputStyle}
                placeholder="e.g. 2"
                onChange={handleInputChange}
              />
            </label>
          </Col>
        </Row>

        {/* ── Row 4: Medication Schedule ── */}
        <label style={labelStyle}>
          Medication Schedule:
          <select
            name="medicationSchedule"
            style={inputStyle}
            onChange={handleInputChange}
            value={medicationSchedule}
          >
            <option value="select">Select Medication Schedule</option>
            <option value="As Required">As Required</option>
            <option value="BEFORE MEAL">BEFORE MEAL</option>
            <option value="AFTER MEAL">AFTER MEAL</option>
            <option value="SOS">SOS</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default MedicineForm;
