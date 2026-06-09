import { useState, useRef, useCallback, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { api } from "../../../constant";
import { postMedicineApi } from "../utils/helperApi";
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

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Function to handle changes in input fields
  const handleMedicineSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setMedicinesInfo([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${api.medicineInfoApiCall}${encodeURIComponent(searchTerm)}`,
      );
      const data = await response.json();
      const medicines = data?.medicines || [];
      setMedicinesInfo(medicines);
      setShowDropdown(medicines.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error("Error fetching medicine:", err);
      setError("Failed to fetch medicines");
      setMedicinesInfo([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "medicineName":
        setMedicineName(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(
          () => handleMedicineSearch(value),
          300,
        );
        emitEvent();
        break;
      case "unit":
        setUnit(value);
        break;
      case "dosage":
        setDosage(value);
        break;
      case "days":
        daysRef.current = value;
        break;
      case "medicationSchedule":
        setMedicationSchedule(value);
        break;
      case "noOfTimes":
        setNoOfTimes(value);
        break;
      default:
        break;
    }
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
    });
  };

  const handleMedicineSelect = (medicine) => {
    setMedicineName(medicine.name);
    setMedicineGeneric(medicine.salt);
    setShowDropdown(false);
    setMedicinesInfo([]);

    emitEvent();
  };

  const emitEvent = () => {
    const updatedData = {
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
    };

    console.log("Child sending:", updatedData); // Check your console!
    onChange(updatedData);
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
        {/* ── Row 1: Unit + Medicine Name ── */}
        <Row>
          <Col xs={12} md={8}>
            <label style={labelStyle}>
              UNIT:
              <select
                name="unit"
                style={inputStyle}
                onChange={handleInputChange}
                value={unit}
              >
                <option value="select">select Unit</option>
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
          <Col xs={12} md={4}>
            <label style={labelStyle}>
              Medicine Name:
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="medicineName"
                  value={medicineName}
                  style={inputStyle}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {loading && (
                  <small
                    style={{ position: "absolute", right: "8px", top: "8px" }}
                  >
                    ...
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
                          onChange({
                            medicineName,
                            medicineGeneric: "",
                            unit,
                            dosage,
                            days: daysRef.current,
                            frequency: Array.isArray(frequency) ? frequency.join(", ") : frequency,
                            noOfTimes,
                            time,
                            medicationSchedule,
                          });
                        }}
                      >
                        Add "{medicineName}" anyway
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
