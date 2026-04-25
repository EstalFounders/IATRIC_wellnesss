import { useState, useRef, useCallback, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { api } from "../../../constant";

const MedicineForm = ({ onChange }) => {
  const [medicineName, setMedicineName] = useState("");
  const [medicineGeneric, setMedicineGeneric] = useState("");
  const [unit, setUnit] = useState("");
  const [dosage, setDosage] = useState("");
  const daysRef = useRef("");
  const [frequency, setFrequency] = useState("");
  const [noOfTimes, setNoOfTimes] = useState("");
  const [time, setTime] = useState("");
  const [medicationSchedule, setMedicationSchedule] = useState("As Required");
  const [loading, setLoading] = useState(false);
  const [medicinesInfo, setMedicinesInfo] = useState([]);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
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
      const response = await fetch(`${api.medicineInfoApiCall}${encodeURIComponent(searchTerm)}`);
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
        debounceRef.current = setTimeout(() => handleMedicineSearch(value), 300);
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
      case "frequency":
        setFrequency(value);
        break;
      case "time":
        setTime(value);
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
      time,
      medicationSchedule,
    });
  };

  const handleMedicineSelect = (medicine) => {
    setMedicineName(medicine.name);
    setMedicineGeneric(medicine.salt);
    setShowDropdown(false);
    setMedicinesInfo([]);
    onChange({
      medicineName: medicine.name,
      medicineGeneric: medicine.salt,
      unit,
      dosage,
      days: daysRef.current,
      frequency,
      noOfTimes,
      time,
      medicationSchedule,
    });
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || medicinesInfo.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < medicinesInfo.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : medicinesInfo.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleMedicineSelect(medicinesInfo[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "grid", gap: "10px" }}>
        <div className="row">
          <div className="col mt-3" xs={12} md={8}>
            <label>
              UNIT:
              <select
                name="unit"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
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
                {/* Add more options as needed */}
              </select>
            </label>
          </div>
          <div className="col mt-3" xs={12} md={4}>
            <label>
              Medicine Name:
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="medicineName"
                  value={medicineName}
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    width: "100%",
                    marginRight: "10px",
                  }}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {loading && (
                  <small style={{ position: "absolute", right: "10px", top: "10px" }}>...</small>
                )}
                {showDropdown && medicinesInfo.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      maxHeight: "200px",
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
                          padding: "8px",
                          cursor: "pointer",
                          backgroundColor: index === selectedIndex ? "#e0e0e0" : "white",
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
                {showDropdown && medicinesInfo.length === 0 && !loading && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      padding: "8px",
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      zIndex: 10,
                      fontStyle: "italic",
                      color: "#777",
                    }}
                  >
                    No medicines found
                  </div>
                )}
              </div>
            </label>
            {error && <div className="text-danger small">{error}</div>}
          </div>
        </div>
                <div className="row">
          <div className="col">
            <label>
              Dosage:
              <input
                type="text"
                name="dosage"
                style={{
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label>
              Days:
              <input
                type="text"
                name="days"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label>
              Frequency:
              <select
                name="frequency"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                onChange={handleInputChange}
                value={frequency}
              >
                <option value="SELECT">Select Frequency</option>
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="SOS">SOS</option>
                <option value="AS REQUIRED">AS REQUIRED</option>
                <option value="ALTERNATIVE DAYS">ALTERNATIVE DAYS</option>
                <option value="BI WEEKLY">BI WEEKLY</option>
                <option value="BI MONTHLY">BI MONTHLY</option>
                {/* Add more options as needed */}
              </select>
            </label>
          </div>
          <div className="col">
            <label>
              No of times:
              <input
                name="noOfTimes"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>

        <label>
          Time:
          <select
            name="time"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
            }}
            onChange={handleInputChange}
            value={time}
          >
            <option value="select">Select Time</option>
            <option value="MORNING">MORNING</option>
            <option value="AFTERNOON">AFTERNOON</option>
            <option value="EVENING">EVENING</option>
            <option value="NIGHT">NIGHT</option>
            <option value="SOS">SOS</option>
            {/* Add more options as needed */}
          </select>
        </label>
        <label>
          Medication Schedule:
          <select
            name="medicationSchedule"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
            }}
            onChange={handleInputChange}
            value={medicationSchedule}
          >
            <option value="select">Select Medication Schedule</option>
            <option value="As Required">As Required</option>
            <option value="BEFORE MEAL">BEFORE MEAL</option>
            <option value="AFTER MEAL">AFTER MEAL</option>
            <option value="SOS">SOS</option>
            {/* Add more options as needed */}
          </select>
        </label>
      </div>
    </div>
  );
};

export default MedicineForm;
